import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  FC,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import LazyImage from "react-lazy-progressive-image";
import { useGeolocation } from "react-use";
import wait from "waait";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Flex,
  Image,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  Text,
} from "@chakra-ui/core";

import { imagePlaceholder } from "../../constants";
import { useTip } from "../components/Tip";
import {
  ANSWER_CATEGORY_IMAGE_ASSOCIATION,
  NOT_ANSWERED_IMAGE,
} from "../graphql/queries";
import { useOtherCategoryModal } from "../utils/useOtherCategoryModal";
import { useUser } from "./Auth";
import { CategoriesContext } from "./Categories";
import { LoadingPage } from "./LoadingPage";

export const CategoryImageAssociation: FC<{
  onlyOwnImages?: boolean;
  refetch?: MutableRefObject<(() => Promise<any>) | undefined>;
}> = ({ onlyOwnImages, refetch: refetchRef }) => {
  const tipAnswerImage = useTip({});
  const { user } = useUser();
  const { push } = useRouter();

  const {
    data: dataNotAnsweredImage,
    error: errorNotAnsweredImage,
    loading: loadingNotAnsweredImage,
    refetch: refetchNotAnsweredImage,
  } = useQuery(NOT_ANSWERED_IMAGE, {
    fetchPolicy: "cache-and-network",
    ssr: false,
    variables: {
      onlyOwnImages,
    },
  });

  useEffect(() => {
    if (refetchRef) {
      refetchRef.current = refetchNotAnsweredImage;
    }
  }, [refetchNotAnsweredImage]);

  if (errorNotAnsweredImage) {
    console.error(JSON.stringify(errorNotAnsweredImage, null, 2));
  }
  const isSelectedCategory = useRef(false);

  const [answerCategoryImageAssociation] = useMutation(
    ANSWER_CATEGORY_IMAGE_ASSOCIATION,
    {
      update: (cache, { data }) => {
        tipAnswerImage();
        isSelectedCategory.current = false;
        cache.writeQuery({
          query: NOT_ANSWERED_IMAGE,
          variables: {
            onlyOwnImages,
          },
          data: {
            notAnsweredImage: data?.answerCategoryImageAssociation,
          },
        });
      },
    }
  );

  const shuffledCategories = useContext(CategoriesContext);

  const notAnsweredImage = dataNotAnsweredImage?.notAnsweredImage;
  const { longitude, latitude } = useGeolocation();

  const { open, close, modal, answer, restartAnswer } = useOtherCategoryModal();

  useEffect(() => {
    if (notAnsweredImage && answer !== undefined) {
      restartAnswer();
      answerCategoryImageAssociation({
        variables: {
          data: {
            image: notAnsweredImage._id,
            categoryChosen: undefined,
            rejectedCategories: shuffledCategories.map(({ _id }) => _id),
            location:
              latitude && longitude ? { latitude, longitude } : undefined,
            otherCategoryInput: answer,
          },
          onlyOwnImages,
        },
      }).then(() => {
        close();
      });
    }
  }, [answer, notAnsweredImage]);

  const ResponsiveCategoryTag = useCallback<
    FC<{
      text?: string;
      _id?: string;
    }>
  >(
    ({ text, _id }) => {
      const [clicked, setClicked] = useState(false);
      const { longitude, latitude } = useGeolocation();

      return (
        <Flex height="100%" alignItems="center" justifyContent="center">
          <Tag
            className="unselectable"
            transition="0.2s all ease-in-out"
            backgroundColor={clicked ? "#cccc00" : _id ? "#8BC63E" : "grey"}
            color="white"
            fontSize={
              clicked
                ? ["1.2em", "1.6em", "2.3em", "2.9em", "3.2em"]
                : ["0.8em", "1.4em", "2.1em", "2.7em", "3em"]
            }
            p={[2, 2, 2, 2, 2]}
            m={["0em", "0.2em", "0.2em", "0.2em", "0.2em"]}
            cursor="pointer"
            overflowWrap="break-word"
            textAlign="center"
            justifyContent="center"
            alignItems="center"
            height={["1.7em", "2.1em", "2.2em"]}
            width="7em"
            onClick={async () => {
              if (!user) {
                push("/login");
                return;
              }
              if (notAnsweredImage && !isSelectedCategory.current) {
                if (_id) {
                  setClicked(true);
                  isSelectedCategory.current = true;

                  await wait(300);
                  await answerCategoryImageAssociation({
                    variables: {
                      data: {
                        image: notAnsweredImage._id,
                        categoryChosen: _id,
                        rejectedCategories: shuffledCategories
                          .filter(cat => {
                            return cat._id !== _id;
                          })
                          .map(({ _id }) => _id),
                        location:
                          latitude && longitude
                            ? { latitude, longitude }
                            : undefined,
                      },
                      onlyOwnImages,
                    },
                  });
                } else {
                  open();
                }
              }
            }}
          >
            {text}
          </Tag>
        </Flex>
      );
    },
    [answerCategoryImageAssociation, notAnsweredImage, shuffledCategories, user]
  );
  if (loadingNotAnsweredImage) {
    return <LoadingPage />;
  }

  return (
    <>
      {modal}
      <Stack align="center" spacing="5em">
        <AnimatePresence>
          {notAnsweredImage ? (
            <motion.div
              key={notAnsweredImage?._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, display: "none" }}
            >
              <Text
                textAlign="center"
                fontSize={["1em", "1.5em", "2em"]}
                m={0}
                p={0}
                pb={3}
              >
                Elige la categoría que más se asocia a la imagen
              </Text>
              <SimpleGrid columns={3}>
                {shuffledCategories.slice(0, 4).map(({ _id, name }) => {
                  return (
                    <ResponsiveCategoryTag text={name} _id={_id} key={_id} />
                  );
                })}
                <LazyImage
                  src={`/api/images/${notAnsweredImage.filename}`}
                  placeholder={imagePlaceholder}
                >
                  {src => {
                    return (
                      <Stack
                        align="center"
                        width="100%"
                        className="image_box"
                        alignSelf="center"
                        textAlign="center"
                        p={2}
                      >
                        {src === imagePlaceholder && <Spinner />}
                        <Image
                          width="100%"
                          height="100%"
                          maxH={["40vh", "40vh", "65vh"]}
                          maxW="90vw"
                          objectFit="contain"
                          src={src}
                        />
                      </Stack>
                    );
                  }}
                </LazyImage>
                {shuffledCategories.slice(4, 6).map(({ _id, name }) => {
                  return (
                    <ResponsiveCategoryTag text={name} key={_id} _id={_id} />
                  );
                })}
                <ResponsiveCategoryTag text="Otra" />

                {shuffledCategories.slice(6).map(({ _id, name }) => {
                  return (
                    <ResponsiveCategoryTag text={name} key={_id} _id={_id} />
                  );
                })}
              </SimpleGrid>
            </motion.div>
          ) : (
            <motion.div
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, display: "none" }}
            >
              <Text p={4} border="1px solid" borderRadius="10px">
                Puedes subir más imágenes para seguir jugando
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </>
  );
};

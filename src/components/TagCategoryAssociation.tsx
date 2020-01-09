import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useGeolocation } from "react-use";
import wait from "waait";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Badge, Flex, SimpleGrid, Stack, Tag, Text } from "@chakra-ui/core";

import { useTip } from "../components/Tip";
import {
  ANSWER_TAG_CATEGORY_ASSOCIATION,
  NOT_ANSWERED_TAG,
} from "../graphql/queries";
import { useOtherCategoryModal } from "../utils/useOtherCategoryModal";
import { useUser } from "./Auth";
import { CategoriesContext } from "./Categories";
import { LoadingPage } from "./LoadingPage";

export const TagCategoryAssociation: FC = () => {
  const { user } = useUser();
  const {
    data: dataNotAnsweredTag,
    error: errorNotAnsweredTag,
    loading: loadingNotAnsweredTag,
  } = useQuery(NOT_ANSWERED_TAG, {
    fetchPolicy: "cache-and-network",
    ssr: false,
  });
  if (errorNotAnsweredTag) {
    console.error(JSON.stringify(errorNotAnsweredTag, null, 2));
  }

  const isSelectedCategory = useRef(false);

  const tipAnswerTag = useTip({});
  const { push } = useRouter();
  const [answerTagCategoryAssociation] = useMutation(
    ANSWER_TAG_CATEGORY_ASSOCIATION,
    {
      update: (cache, { data }) => {
        tipAnswerTag();
        isSelectedCategory.current = false;
        cache.writeQuery({
          query: NOT_ANSWERED_TAG,
          data: {
            notAnsweredTag: data?.answerTagCategoryAssociation,
          },
        });
      },
    }
  );

  const shuffledCategories = useContext(CategoriesContext);

  const notAnsweredTag = dataNotAnsweredTag?.notAnsweredTag;

  const { open, close, modal, answer, restartAnswer } = useOtherCategoryModal();
  const { longitude, latitude } = useGeolocation();

  useEffect(() => {
    if (notAnsweredTag && answer !== undefined) {
      restartAnswer();
      answerTagCategoryAssociation({
        variables: {
          data: {
            tag: notAnsweredTag._id,
            categoryChosen: undefined,
            rejectedCategories: shuffledCategories.map(({ _id }) => _id),
            location:
              latitude && longitude ? { latitude, longitude } : undefined,
            otherCategoryInput: answer,
          },
        },
      }).then(() => {
        close();
      });
    }
  }, [answer, notAnsweredTag]);

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
            m={["0em", "0.2em", "0.2em", "0.4em", "0.8em"]}
            cursor="pointer"
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
              if (notAnsweredTag && !isSelectedCategory.current) {
                if (_id) {
                  setClicked(true);
                  isSelectedCategory.current = true;

                  await wait(300);
                  await answerTagCategoryAssociation({
                    variables: {
                      data: {
                        tag: notAnsweredTag._id,
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
    [answerTagCategoryAssociation, notAnsweredTag, shuffledCategories, user]
  );

  if (loadingNotAnsweredTag) {
    return <LoadingPage />;
  }

  return (
    <>
      {modal}
      <Stack>
        <AnimatePresence>
          {notAnsweredTag ? (
            <motion.div
              key={notAnsweredTag._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, display: "none" }}
            >
              <SimpleGrid columns={3}>
                {shuffledCategories.slice(0, 4).map(({ _id, name }) => {
                  return (
                    <ResponsiveCategoryTag text={name} _id={_id} key={_id} />
                  );
                })}
                <Badge
                  p={5}
                  m={5}
                  backgroundColor="white"
                  color="rgb(255,0,0)"
                  borderColor="#E3321F"
                  border="2px solid"
                  fontSize={["3.3vw", "3.5vw", "3.7vw", "4.0vw", "4.2vw"]}
                  variant="solid"
                  whiteSpace="break-spaces"
                  textAlign="center"
                  lineHeight="taller"
                  borderRadius="10px"
                  verticalAlign="middle"
                  alignContent="center"
                  alignItems="center"
                  justifyContent="center"
                  justifyItems="center"
                  maxWidth="35vw"
                >
                  {notAnsweredTag.name}
                </Badge>
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
              <Text>Muchas gracias por jugar</Text>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </>
  );
};

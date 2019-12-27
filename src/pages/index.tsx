import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import { useRouter } from "next/router";
import {
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
} from "react-icons/fa";
import LazyImage from "react-lazy-progressive-image";
import { useRememberState } from "use-remember-state";

import { Box, Image, Stack, Text } from "@chakra-ui/core";

import { imagePlaceholder } from "../../constants";
import { FakeHref } from "../components/FakeHref";

const IndexPage: NextPage = () => {
  const [page, setPage] = useRememberState<"introduction" | "games">(
    "index_page",
    "introduction"
  );

  const { push } = useRouter();
  return (
    <Stack
      align="center"
      spacing="3em"
      pt="1em"
      width="100%"
      className="unselectable"
    >
      <LazyImage src="/logo_fireses.png" placeholder={imagePlaceholder}>
        {src => {
          return (
            <Image
              src={src}
              width="100%"
              height="100%"
              objectFit="contain"
              maxWidth="20vw"
              maxHeight="20vh"
            />
          );
        }}
      </LazyImage>

      <AnimatePresence>
        <Box textAlign="end" width="100%" mr="10%">
          <Box
            cursor="pointer"
            as={
              page === "introduction"
                ? FaRegArrowAltCircleRight
                : FaRegArrowAltCircleLeft
            }
            size="3em"
            color="black"
            onClick={() => {
              setPage(page === "introduction" ? "games" : "introduction");
            }}
          />
        </Box>

        {page === "introduction" && (
          <motion.div
            key="introduction"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, display: "block" }}
            exit={{ opacity: 0, display: "none" }}
          >
            <Text className="unselectable" fontSize="2em" textAlign="center">
              ¿Qué evaluar para aumentar la resiliciencia de los
              socioecosistemas a los incendios?
            </Text>

            <LazyImage src="/introduction.png" placeholder={imagePlaceholder}>
              {src => {
                return (
                  <Image
                    className="unselectable"
                    src={src}
                    width="100%"
                    height="100%"
                    objectFit="contain"
                    maxWidth="90vw"
                    maxHeight="50vh"
                  />
                );
              }}
            </LazyImage>
          </motion.div>
        )}

        {page === "games" && (
          <motion.div
            key="games"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, display: "block" }}
            exit={{ opacity: 0, display: "none" }}
          >
            <Text className="unselectable" fontSize="2em" textAlign="center">
              ¿Cómo nos puedes ayudar? Etiquetando...
            </Text>

            <Stack isInline spacing="1em">
              <FakeHref href="/tag">
                <LazyImage src="/game_tag.png" placeholder={imagePlaceholder}>
                  {src => {
                    return (
                      <Image
                        src={src}
                        width="100%"
                        height="100%"
                        objectFit="contain"
                        maxWidth="90vw"
                        maxHeight="50vh"
                        cursor="pointer"
                        onClick={() => {
                          push("/tag");
                        }}
                      />
                    );
                  }}
                </LazyImage>
              </FakeHref>

              <FakeHref href="/image">
                <LazyImage src="/game_image.png" placeholder={imagePlaceholder}>
                  {src => {
                    return (
                      <Image
                        src={src}
                        width="100%"
                        height="100%"
                        objectFit="contain"
                        maxWidth="90vw"
                        maxHeight="50vh"
                        cursor="pointer"
                        onClick={() => {
                          push("/image");
                        }}
                      />
                    );
                  }}
                </LazyImage>
              </FakeHref>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
};

export default IndexPage;

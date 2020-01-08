import { NextPage } from "next";
import { useRouter } from "next/router";
import { FC } from "react";
import { FaFileImage, FaFileUpload } from "react-icons/fa";
import { MdTextFields } from "react-icons/md";

import { Box, Heading, Stack } from "@chakra-ui/core";

import { FakeHref } from "../components/FakeHref";
import { useShouldBeCentered } from "../utils/useShouldBeCentered";

const iconSize = "3.5em";
const textSize = "1.3em";

const GameTitle: FC = ({ children }) => {
  return (
    <Heading
      alignSelf="center"
      textAlign="center"
      borderRadius="10px"
      backgroundColor="#8BC63E"
      color="white"
      p={2}
      m={0}
      width="150px"
      fontSize={textSize}
    >
      {children}
    </Heading>
  );
};

const IndexPage: NextPage = () => {
  const { push } = useRouter();
  const shouldBeCentered = useShouldBeCentered(400);

  return (
    <Stack
      transition="all 1s"
      {...(shouldBeCentered
        ? { height: "100%", justifyContent: "center" }
        : {
            paddingTop: "1em",
            paddingBottom: "1em",
          })}
      className="indexPage"
      alignItems="center"
    >
      <FakeHref href="/tag">
        <Stack
          spacing="2em"
          isInline
          pb={1}
          alignItems="center"
          justifyContent="space-around"
          onClick={() => {
            push("/tag");
          }}
          cursor="pointer"
          color="black"
        >
          <Box p={5} border="1px solid" borderRadius="15px">
            <Box
              as={MdTextFields}
              m={0}
              p={0}
              fontSize={iconSize}
              verticalAlign="middle"
            />
          </Box>
          <Box>
            <GameTitle>Asocia palabras</GameTitle>
          </Box>
        </Stack>
      </FakeHref>

      <FakeHref href="/image">
        <Stack
          spacing="2em"
          isInline
          p={1}
          alignItems="center"
          justifyContent="space-around"
          cursor="pointer"
          color="black"
          onClick={() => {
            push("/image");
          }}
        >
          <Box p={5} border="1px solid" borderRadius="15px">
            <Box as={FaFileImage} fontSize={iconSize} verticalAlign="middle" />
          </Box>
          <Box>
            <GameTitle>Etiqueta imágenes</GameTitle>
          </Box>
        </Stack>
      </FakeHref>
      <FakeHref href="/upload">
        <Stack
          isInline
          spacing="2em"
          p={1}
          alignItems="center"
          justifyContent="space-around"
          onClick={() => {
            push("/upload");
          }}
          cursor="pointer"
          color="black"
        >
          <Box p={5} border="1px solid" borderRadius="15px">
            <Box as={FaFileUpload} fontSize={iconSize} verticalAlign="middle" />
          </Box>

          <Box>
            <GameTitle>Comparte tus fotos</GameTitle>
          </Box>
        </Stack>
      </FakeHref>
    </Stack>
  );
};

export default IndexPage;

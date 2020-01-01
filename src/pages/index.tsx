import { NextPage } from "next";
import { useRouter } from "next/router";
import { FC } from "react";

import { Heading, Image, Stack, Text } from "@chakra-ui/core";

import { FakeHref } from "../components/FakeHref";

const Header: FC = ({ children }) => {
  return (
    <Heading
      alignSelf="flex-start"
      textAlign="center"
      borderRadius="10px"
      backgroundColor="#0C9ADB"
      color="white"
      p={3}
      ml="10%"
      mr="10%"
    >
      {children}
    </Heading>
  );
};

const Paragraph: FC = ({ children }) => {
  return (
    <Text fontSize="1.5em" textAlign="justify" maxWidth="80%" ml="10%" mr="10%">
      {children}
    </Text>
  );
};

const IndexPage: NextPage = () => {
  const { push } = useRouter();
  return (
    <Stack spacing="1em" pt="1em" pb="2em" width="100%">
      <Image
        src="/logo_fireses.png"
        width="100%"
        height="100%"
        objectFit="contain"
        maxHeight="20vh"
      />
      <Header>
        ¿Qué factores se deben considerar para ser resiliente a los incendios?
      </Header>
      <Paragraph>
        Las siguientes categorías influyen en la resiliencia a incendios en
        socioecosistemas en Chile:
      </Paragraph>
      <Image
        src="/introduction.png"
        width="100%"
        height="100%"
        objectFit="contain"
        maxWidth="90vw"
        maxHeight="50vh"
      />
      <Header>¿Cómo puedes ayudarnos?</Header>
      <Paragraph>
        Ayúdanos a identificar sus características asociándolas a conceptos e
        imágenes, y también al compartir tus fotos que las representen.
      </Paragraph>
      <Header>¡Participa y gana premios!</Header>
      <Paragraph>
        Recibirás tips en el camino, y al que más participe durante febrero 2020
        le regalaremos una cámara polaroid con 200 fotos.
      </Paragraph>
      <Text fontSize="2em" textAlign="center" ml="10%" mr="10%">
        Para participar haz click{" "}
        <FakeHref href="/login?route=/games">
          <b
            style={{
              backgroundColor: "cyan",
              color: "black",
              padding: "5px",
              borderRadius: "5px",
            }}
            onClick={() => {
              push("/login?route=/games");
            }}
          >
            aquí
          </b>
        </FakeHref>
      </Text>
    </Stack>
  );
};

export default IndexPage;

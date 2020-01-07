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
      backgroundColor="#8BC63E"
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
      <Header>Así estudiamos los incendios</Header>
      <Image
        alignSelf="center"
        src="/introduction.png"
        width="100%"
        height="100%"
        objectFit="contain"
        maxWidth="90vw"
        maxHeight="50vh"
      />
      <Header>Ayúdanos jugando</Header>
      <Paragraph>Comparte tus fotos, asocia imágenes y conceptos.</Paragraph>
      <Header>¡Participa y gana premios!</Header>
      <Paragraph>
        Recibirás consejos mientras juegas, y mientras más participes de todos
        los juegos durante febrero 2020, irás subiendo de categoría hasta poder
        entrar al sorteo de una cámara Polaroid y más de 100 fotos
      </Paragraph>
      <Text fontSize="2em" textAlign="center" ml="10%" mr="10%">
        Para participar haz click{" "}
        <FakeHref href="/login?route=/games">
          <b
            style={{
              backgroundColor: "#57585A",
              color: "white",
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

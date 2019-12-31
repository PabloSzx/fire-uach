import { NextPage } from "next";
import { useRouter } from "next/router";

import { Image, Stack, Text } from "@chakra-ui/core";

import { FakeHref } from "../components/FakeHref";

const IndexPage: NextPage = () => {
  const { push } = useRouter();
  return (
    <Stack align="center" spacing="2em" pt="1em" width="100%">
      <Image
        src="/logo_fireses.png"
        width="100%"
        height="100%"
        objectFit="contain"
        maxWidth="20vw"
        maxHeight="20vh"
      />
      <Text fontSize="1.5em" textAlign="center">
        Las siguientes categorías influyen en la resiliencia a incendios en
        socioecosistemas en Chile:
      </Text>
      <Image
        src="/introduction.png"
        width="100%"
        height="100%"
        objectFit="contain"
        maxWidth="90vw"
        maxHeight="50vh"
      />
      <Text fontSize="1.5em" textAlign="center">
        Ayúdanos a identificar sus características asociándolas a conceptos e
        imágenes, y también al compartir tus fotos que las representen.
      </Text>
      <Text fontSize="1.5em" textAlign="center">
        Recibiras tips en el camino, y al que más participe durante febrero 2020
        le regalaremos una cámara polaroid con 200 fotos.
      </Text>
      <Text fontSize="1.5em" textAlign="center">
        Para participar haz click{" "}
        <FakeHref href="/login?route=/games">
          <b
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

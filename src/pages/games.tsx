import { NextPage } from "next";
import { useRouter } from "next/router";

import { Image, Stack } from "@chakra-ui/core";

import { FakeHref } from "../components/FakeHref";

const IndexPage: NextPage = () => {
  const { push } = useRouter();
  return (
    <Stack align="center" spacing="3em" pt="1em" width="100%">
      <FakeHref href="/tag">
        <Image
          border="1px solid"
          borderRadius="10px"
          src="/game_tag.png"
          width="100%"
          height="100%"
          objectFit="contain"
          maxWidth="90vw"
          maxHeight="50vh"
          cursor="pointer"
          p={5}
          onClick={() => {
            push("/tag");
          }}
        />
      </FakeHref>

      <FakeHref href="/image">
        <Image
          border="1px solid"
          borderRadius="10px"
          src="/game_image.png"
          width="100%"
          height="100%"
          objectFit="contain"
          maxWidth="90vw"
          maxHeight="50vh"
          cursor="pointer"
          p={5}
          onClick={() => {
            push("/image");
          }}
        />
      </FakeHref>
      <FakeHref href="/upload">
        <Image
          border="1px solid"
          borderRadius="10px"
          src="/game_upload.png"
          width="100%"
          height="100%"
          objectFit="contain"
          maxWidth="90vw"
          maxHeight="50vh"
          cursor="pointer"
          p={5}
          onClick={() => {
            push("/upload");
          }}
        />
      </FakeHref>
    </Stack>
  );
};

export default IndexPage;

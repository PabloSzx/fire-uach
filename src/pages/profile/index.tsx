import { truncate } from "lodash";
import { NextPage } from "next";
import { FC } from "react";

import { useQuery } from "@apollo/react-hooks";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Spinner,
  Stack,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/core";

import { useUser } from "../../components/Auth";
import { LoadingPage } from "../../components/LoadingPage";
import { OWN_STATS, RANKING_STATS } from "../../graphql/queries";

const Stats: FC = () => {
  const { data: dataOwnStats, loading: loadingOwnStats } = useQuery(OWN_STATS, {
    fetchPolicy: "cache-and-network",
  });

  const {
    data: dataRanking,
    loading: loadingRanking,
    error: errorRanking,
  } = useQuery(RANKING_STATS);

  const { user: authUser } = useUser("/profile");

  if (errorRanking) {
    console.error(JSON.stringify(errorRanking, null, 2));
  }

  if (loadingOwnStats || loadingRanking || !dataRanking || !dataOwnStats) {
    return <Spinner />;
  }

  const {
    nAssociatedImages,
    nAssociatedTags,
    nUploadedImages,
    nValidatedUploadedImages,
    imagesLevel,
    tagsLevel,
    uploadLevel,
    overallLevel,
    rankingPosition,
  } = dataOwnStats.ownStats;

  const ranking = dataRanking.rankingStats;

  return (
    <Stack alignItems="center" mb="3em">
      <Heading textAlign="center">Tu progreso</Heading>

      <StatGroup textAlign="center" alignItems="center">
        <Stat p={0} m={4}>
          <StatLabel>Imágenes asociadas</StatLabel>
          <StatNumber>{nAssociatedImages}</StatNumber>
        </Stat>

        <Stat p={0} m={4}>
          <StatLabel>Etiquetas asociadas</StatLabel>
          <StatNumber>{nAssociatedTags}</StatNumber>
        </Stat>
        <Stat p={0} m={4}>
          <StatLabel>Imágenes subidas por ti</StatLabel>
          <StatNumber>{nUploadedImages}</StatNumber>
          <StatHelpText>
            {nUploadedImages === 0
              ? "Te invitamos a contribuir con la comunidad"
              : "Recuerda que puedes subir más imágenes y clasificarlas"}
          </StatHelpText>
        </Stat>
        {nValidatedUploadedImages > 0 && (
          <Stat p={0} m={4}>
            <StatLabel>
              Imágenes subidas por ti validadas por expertos
            </StatLabel>
            <StatNumber>{nValidatedUploadedImages}</StatNumber>
            <StatHelpText>
              ¡Muchas gracias por contribuir con la comunidad!
            </StatHelpText>
          </Stat>
        )}
      </StatGroup>

      <StatGroup textAlign="center" alignItems="center">
        <Stat p={0} m={4}>
          <StatLabel>Nivel Asociación de Imágenes</StatLabel>
          <StatNumber>{imagesLevel}</StatNumber>
        </Stat>

        <Stat p={0} m={4}>
          <StatLabel>Nivel Asociación de Etiquetas</StatLabel>
          <StatNumber>{tagsLevel}</StatNumber>
        </Stat>
        <Stat p={0} m={4}>
          <StatLabel>Nivel Contribución de imágenes</StatLabel>
          <StatNumber>{uploadLevel}</StatNumber>
        </Stat>

        <Stat p={0} m={4}>
          <StatLabel>Nivel general</StatLabel>
          <StatNumber>{overallLevel}</StatNumber>
          <StatHelpText>Nivel acumulado entre todos los juegos</StatHelpText>
        </Stat>
      </StatGroup>

      <Heading textAlign="center">Ranking general</Heading>

      <Stack textAlign="center" p={0} alignItems="center">
        {ranking
          .filter(({ user }) => user?.email)
          .map(({ _id, user, overallLevel }, key) => {
            return (
              <Flex key={_id} alignItems="center">
                <Text m={0}>{key + 1}.</Text>
                <Badge
                  ml={2}
                  mr={2}
                  variantColor={user?._id === authUser._id ? "blue" : "green"}
                >
                  {user?.email.split("@")[0]}
                </Badge>
                <Badge ml={2} mr={2}>
                  Nivel {overallLevel}
                </Badge>
              </Flex>
            );
          })}
      </Stack>
      {rankingPosition > 4 && (
        <Stack alignItems="center">
          <Text>...</Text>
          <Flex alignItems="center">
            <Text m={0}>{rankingPosition + 1}.</Text>
            <Badge ml={2} mr={2} variantColor="blue">
              {authUser?.email.split("@")[0]}
            </Badge>
            <Badge ml={2} mr={2}>
              Nivel {overallLevel}
            </Badge>
          </Flex>
        </Stack>
      )}
    </Stack>
  );
};

const ProfilePage: NextPage = ({}) => {
  const { user, loading: loadingUser } = useUser(
    "/profile",
    false,
    "cache-and-network"
  );

  if (loadingUser) {
    return <LoadingPage />;
  }

  return (
    <Stack align="center">
      <Box p={10}>
        <Text fontSize={["1em", "1em", "2em"]} textAlign="center">
          Bienvenido <b>{truncate(user.email.split("@")[0], { length: 45 })}</b>
        </Text>
      </Box>
      <Stats />
    </Stack>
  );
};

export default ProfilePage;

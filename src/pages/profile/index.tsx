import { truncate } from "lodash";
import { NextPage } from "next";
import { FC } from "react";

import { useQuery } from "@apollo/react-hooks";
import {
  Box,
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
import { Logout } from "../../components/Logout";
import { OWN_STATS } from "../../graphql/queries";

const Stats: FC = () => {
  const { data, loading } = useQuery(OWN_STATS, {
    fetchPolicy: "cache-and-network",
  });
  if (loading || !data) {
    return <Spinner />;
  }
  return (
    <StatGroup textAlign="center" alignItems="center">
      <Stat p={0} m={4}>
        <StatLabel>Imágenes asociadas</StatLabel>
        <StatNumber>{data.ownStats.nAssociatedImages}</StatNumber>
      </Stat>

      <Stat p={0} m={4}>
        <StatLabel>Etiquetas asociadas</StatLabel>
        <StatNumber>{data.ownStats.nAssociatedTags}</StatNumber>
      </Stat>
      <Stat p={0} m={4}>
        <StatLabel>Imágenes subidas por ti</StatLabel>
        <StatNumber>{data.ownStats.nUploadedImages}</StatNumber>
        <StatHelpText>
          {data.ownStats.nUploadedImages === 0
            ? "Te invitamos a contribuir con la comunidad"
            : "Recuerda que puedes subir más imagenes y clasificarlas"}
        </StatHelpText>
      </Stat>
      {data.ownStats.nValidatedUploadedImages > 0 && (
        <Stat p={0} m={4}>
          <StatLabel>Imágenes subidas por ti validadas por expertos</StatLabel>
          <StatNumber>{data.ownStats.nValidatedUploadedImages}</StatNumber>
          <StatHelpText>
            ¡Muchas gracias por contribuir con la comunidad!
          </StatHelpText>
        </Stat>
      )}
    </StatGroup>
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
          Bienvenido <b>{truncate(user.email, { length: 45 })}</b>
        </Text>
      </Box>
      <Stats />
      <Logout />
    </Stack>
  );
};

export default ProfilePage;

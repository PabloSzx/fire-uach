import sha256 from "crypto-js/sha256";
import { map } from "lodash";
import { useRouter } from "next/router";
import React, { ChangeEvent, FC, useState } from "react";
import { isEmail } from "validator";

import { useMutation } from "@apollo/react-hooks";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Image,
  Input,
  Stack,
  Text,
} from "@chakra-ui/core";

import { LOCKED_USER, WRONG_INFO } from "../../../../constants";
import { CURRENT_USER, UNLOCK } from "../../../graphql/queries";

const UnlockPage: FC = () => {
  const {
    query: { email, unlockKey },
    replace,
    push,
  } = useRouter();

  const [unlock, { error: unlockError, loading }] = useMutation(UNLOCK, {
    update: (cache, { data }) => {
      if (data?.unlock) {
        cache.writeQuery({
          query: CURRENT_USER,
          data: {
            currentUser: data.unlock,
          },
        });
        push("/");
      }
    },
    onError: err => {
      console.error(JSON.stringify(err, null, 2));
    },
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (
    typeof email !== "string" ||
    typeof unlockKey !== "string" ||
    !isEmail(email)
  ) {
    replace("/");
    return null;
  }

  return (
    <>
      <form
        onSubmit={async ev => {
          ev.preventDefault();

          if (password.length < 3 || password !== confirmPassword) {
            return;
          }

          await unlock({
            variables: {
              data: {
                email,
                unlockKey,
                password: sha256(password).toString(),
              },
            },
          });
        }}
      >
        <Stack align="center">
          <Image
            src="/logo_fireses.png"
            width="100%"
            height="100%"
            maxW="60vw"
            maxH="20vh"
            alt="fire-ses-logo"
            objectFit="contain"
          />
          {unlockError && (
            <Box width={["80%", "60%", "40%"]}>
              <Alert
                status="error"
                minHeight="200px"
                justifyContent="center"
                flexDirection="column"
                textAlign="center"
              >
                <AlertIcon size="40px" mr={0} />
                <AlertTitle>
                  {map(unlockError.graphQLErrors, ({ message }, key) => {
                    switch (message) {
                      case WRONG_INFO: {
                        message =
                          "Cuenta inexistente o llave de seguridad incorrecta";
                        break;
                      }
                      case LOCKED_USER: {
                        message = "Usuario bloqueado por seguridad";
                        break;
                      }
                      default:
                    }
                    return <Text key={key}>{message}</Text>;
                  })}
                </AlertTitle>
              </Alert>
            </Box>
          )}
          <Stack>
            <Text>Nueva contraseña</Text>
            <Input
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) => {
                setPassword(value);
              }}
            />
          </Stack>
          <Stack>
            <Text>Repita su nueva contraseña</Text>
            <Input
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) => {
                setConfirmPassword(value);
              }}
            />
          </Stack>
          <Button
            type="submit"
            cursor="pointer"
            variantColor="blue"
            isDisabled={
              loading || password.length < 3 || confirmPassword !== password
            }
            leftIcon="unlock"
            isLoading={loading}
          >
            Recuperar cuenta
          </Button>
        </Stack>
      </form>
    </>
  );
};

export default UnlockPage;

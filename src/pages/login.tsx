import sha256 from "crypto-js/sha256";
import { Formik } from "formik";
import { map } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import LazyImage from "react-lazy-progressive-image";
import { isEmail } from "validator";

import { useMutation } from "@apollo/react-hooks";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Image,
  Input,
  Stack,
  Text,
} from "@chakra-ui/core";

import { imagePlaceholder, LOCKED_USER, WRONG_INFO } from "../../constants";
import { useUser } from "../components/Auth";
import { LoadingPage } from "../components/LoadingPage";
import { CURRENT_USER, LOGIN } from "../graphql/queries";

const LoginPage: NextPage = () => {
  const { user, loading } = useUser();

  const {
    query: { route },
    push,
  } = useRouter();

  const [login, { error: loginError }] = useMutation(LOGIN, {
    update: (cache, { data }) => {
      if (data?.login._id) {
        cache.writeQuery({
          query: CURRENT_USER,
          data: {
            currentUser: data.login,
          },
        });
      }
    },
    onError: err => {
      console.error(JSON.stringify(err, null, 2));
    },
  });

  if (loading) {
    return <LoadingPage />;
  }
  if (user) {
    switch (route) {
      case "/profile":
      case "/upload":
      case "/admin":
      case "/": {
        push(route);
        break;
      }
      default:
        push("/");
    }
    return <LoadingPage />;
  }

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      onSubmit={async ({ email, password }) => {
        try {
          await login({
            variables: {
              data: {
                email,
                password: sha256(password).toString(),
              },
            },
          });
        } catch (err) {}
      }}
      validate={({ email, password }) => {
        const errors: Record<string, string> = {};

        if (!isEmail(email)) {
          errors.email = "Email invalido!";
        }
        if (password.length < 3) {
          errors.password = "Password invalido!";
        }

        return errors;
      }}
    >
      {({
        handleChange,
        values,
        handleBlur,
        handleSubmit,
        isSubmitting,
        errors,
        touched,
        isValid,
        dirty,
      }) => {
        return (
          <form onSubmit={handleSubmit}>
            <Stack align="center">
              <Flex justifyContent="center" w="80%">
                <LazyImage
                  src="/logo_fireses.png"
                  placeholder={imagePlaceholder}
                >
                  {src => {
                    return (
                      <Image
                        w="100%"
                        h="100%"
                        maxW="60vw"
                        maxH="20vh"
                        src={src}
                        alt="fire-ses-logo"
                        objectFit="contain"
                      />
                    );
                  }}
                </LazyImage>
              </Flex>
              {loginError && (
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
                      {map(loginError.graphQLErrors, ({ message }, key) => {
                        switch (message) {
                          case WRONG_INFO: {
                            message =
                              "Correo electrónico o contraseña incorrectos";
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

              <Box width={["80%", "60%", "40%"]}>
                <FormControl isInvalid={!!(touched.email && errors.email)}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>
              </Box>
              <Box width={["80%", "60%", "40%"]}>
                <FormControl
                  isInvalid={!!(touched.password && errors.password)}
                >
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
              </Box>
              <Box width="50%" textAlign="center">
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  variantColor="blue"
                  isDisabled={!isValid || !dirty}
                >
                  Inicar Sesión
                </Button>
              </Box>
              <Box width="50%" textAlign="center">
                <Button
                  size="lg"
                  variantColor="green"
                  onClick={() => {
                    try {
                      localStorage.setItem("password", values.password || "");
                    } catch (err) {}
                    if (route) {
                      push(
                        `/sign_up?route=${route}${
                          values.email ? "&email=" + values.email : ""
                        }`
                      );
                    } else {
                      if (values.email) {
                        push(
                          `/sign_up${
                            values.email ? "?email=" + values.email : ""
                          }`
                        );
                      } else {
                        push("/sign_up");
                      }
                    }
                  }}
                >
                  Registrarse
                </Button>
              </Box>
            </Stack>
          </form>
        );
      }}
    </Formik>
  );
};

export default LoginPage;

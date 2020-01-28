import sha256 from "crypto-js/sha256";
import { Formik } from "formik";
import { map } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { FaQuestion, FaSignInAlt } from "react-icons/fa";
import LazyImage from "react-lazy-progressive-image";
import { toast } from "react-toastify";
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
import { CURRENT_USER, FORGOT_PASSWORD, LOGIN } from "../graphql/queries";

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

  const [forgotPassword, { loading: loadingForgotPassword }] = useMutation(
    FORGOT_PASSWORD,
    {
      onError: err => {
        console.error(JSON.stringify(err, null, 2));
      },
    }
  );

  if (loading) {
    return <LoadingPage />;
  }
  if (user) {
    switch (route) {
      case "/profile":
      case "/upload":
      case "/games":
      case "/tag":
      case "image":
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
                  <FormLabel>Contraseña</FormLabel>
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
                  leftIcon={FaSignInAlt}
                  cursor="pointer"
                >
                  Iniciar Sesión
                </Button>
              </Box>
              <Box width="50%" textAlign="center">
                <Button
                  size="lg"
                  variantColor="green"
                  cursor="pointer"
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
                  leftIcon={FaSignInAlt}
                >
                  Registrarse
                </Button>
              </Box>
              {
                <Box width="50%" textAlign="center">
                  <Button
                    cursor="pointer"
                    size="lg"
                    variantColor="cyan"
                    isDisabled={loadingForgotPassword || !isEmail(values.email)}
                    onClick={async ev => {
                      ev.preventDefault();
                      if (isEmail(values.email)) {
                        const forgotResult = await forgotPassword({
                          variables: {
                            email: values.email,
                          },
                        });

                        if (forgotResult.data?.forgotPassword) {
                          toast(
                            <Stack>
                              <Text>
                                <b>Revise su correo electrónico</b>
                              </Text>
                              <Text>
                                <i>
                                  Recuerde tambien revisar su carpeta de correos
                                  no deseado
                                </i>
                              </Text>
                            </Stack>,

                            {
                              type: "success",
                              autoClose: 20000,
                              closeOnClick: false,
                            }
                          );
                        } else {
                          toast(
                            <Stack>
                              <Text>
                                Su correo electrónico no tiene cuenta asociada o
                                se encuentra bloqueada por seguridad
                              </Text>
                            </Stack>,
                            {
                              type: "error",
                              autoClose: 10000,
                              closeOnClick: true,
                            }
                          );
                        }
                      }
                    }}
                    leftIcon={FaQuestion}
                    isLoading={loadingForgotPassword}
                  >
                    Olvidé mi contraseña
                  </Button>
                </Box>
              }
            </Stack>
          </form>
        );
      }}
    </Formik>
  );
};

export default LoginPage;

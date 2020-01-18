import sha256 from "crypto-js/sha256";
import { Formik } from "formik";
import { map } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { FC } from "react";
import { FaSignInAlt } from "react-icons/fa";
import LazyImage from "react-lazy-progressive-image";
import { isEmail } from "validator";

import { useMutation } from "@apollo/react-hooks";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/core";

import {
  imagePlaceholder,
  USER_ALREADY_EXISTS,
  UserType,
} from "../../constants";
import { userTypeToText } from "../../constants/enums";
import { useUser } from "../components/Auth";
import { LoadingPage } from "../components/LoadingPage";
import { CURRENT_USER, SIGN_UP } from "../graphql/queries";

const SignUpPage: NextPage = () => {
  const { user, loading } = useUser();
  const {
    query: { route, email },
    push,
  } = useRouter();

  const [signUp, { error: loginError }] = useMutation(SIGN_UP, {
    update: (cache, { data }) => {
      if (data?.signUp._id) {
        cache.writeQuery({
          query: CURRENT_USER,
          data: {
            currentUser: data.signUp,
          },
        });
      }
    },
    onError: err => {
      console.error(JSON.stringify(err, null, 2));
    },
  });

  const { isOpen: isOpenTermsAndConditions, onOpen, onClose } = useDisclosure(
    false
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
    <>
      <Formik
        initialValues={{
          email: typeof email === "string" && email ? email : "",
          password: (() => {
            try {
              const pass = localStorage.getItem("password");
              if (pass !== null) {
                localStorage.removeItem("password");
              }
              return pass || "";
            } catch (err) {
              return "";
            }
          })(),
          types: [] as UserType[],
          typeSpecify: "",
          fireRelated: false,
          fireRelatedSpecify: "",
          termsAndConditions: true,
        }}
        onSubmit={async ({
          email,
          password,
          types,
          typeSpecify,
          fireRelated,
          fireRelatedSpecify,
        }) => {
          try {
            await signUp({
              variables: {
                data: {
                  email,
                  password: sha256(password).toString(),
                  types,
                  typeSpecify,
                  fireRelated,
                  fireRelatedSpecify,
                },
              },
            });
          } catch (err) {}
        }}
        validate={({
          email,
          password,
          termsAndConditions,
          types,
          typeSpecify,
          fireRelatedSpecify,
        }) => {
          const errors: Record<string, string> = {};

          if (!isEmail(email)) {
            errors.email = "Email invalido!";
          }
          if (password.length < 3) {
            errors.password = "Contraseña invalida!";
          }
          if (!termsAndConditions) {
            errors.termsAndConditions =
              "Debe aceptar los términos y condiciones!";
          }
          if (types.length === 0) {
            errors.type = "Debe especifir al menos una opcion";
          }

          if (typeSpecify.length > 50) {
            errors.typeSpecify = "Hasta 50 caracteres";
          }
          if (fireRelatedSpecify.length > 50) {
            errors.fireRelatedSpecify = "Hasta 50 caracteres";
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
          setFieldValue,
        }) => {
          const TypeCheckbox: FC<{ children: UserType }> = ({
            children: typeCheck,
          }) => {
            return (
              <Checkbox
                isChecked={values.types.includes(typeCheck)}
                onChange={() => {
                  if (values.types.includes(typeCheck)) {
                    setFieldValue(
                      "types",
                      values.types.filter(type => type !== typeCheck)
                    );
                  } else {
                    setFieldValue("types", [...values.types, typeCheck]);
                  }
                }}
                variantColor="green"
                aria-label={typeCheck}
                borderColor="grey"
              >
                {userTypeToText(typeCheck)}
              </Checkbox>
            );
          };

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
                            case USER_ALREADY_EXISTS: {
                              message =
                                "Correo electrónico especificado ya se encuentra registrado";
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
                  <FormControl
                    isInvalid={!!(touched.email && errors.email)}
                    isRequired
                  >
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
                    isRequired
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
                <Divider width="80%" />
                <Box width={["80%", "60%", "40%"]}>
                  <FormControl
                    isInvalid={!!(touched.types && errors.types)}
                    isRequired
                  >
                    <FormLabel as="h3" fontSize="1.5em">
                      <b>
                        Elige una o más opciones con la(s) que te identificas.
                        Soy:
                      </b>
                    </FormLabel>

                    <Stack>
                      <TypeCheckbox>
                        {UserType.scientificOrAcademic}
                      </TypeCheckbox>

                      <TypeCheckbox>
                        {UserType.technicianOrProfessional}
                      </TypeCheckbox>

                      <TypeCheckbox>{UserType.student}</TypeCheckbox>
                      <TypeCheckbox>{UserType.corralHabitant}</TypeCheckbox>
                      <TypeCheckbox>
                        {UserType.villaAlemanaHabitant}
                      </TypeCheckbox>
                      <TypeCheckbox>{UserType.other}</TypeCheckbox>
                    </Stack>

                    <FormErrorMessage>{errors.types}</FormErrorMessage>
                  </FormControl>
                </Box>
                <Box width={["80%", "60%", "40%"]}>
                  <FormControl
                    isRequired={values.types.includes(UserType.other)}
                    isInvalid={!!errors.typeSpecify}
                  >
                    <FormLabel>Especifica</FormLabel>
                    <Input
                      name="typeSpecify"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.typeSpecify}
                    />
                    <FormErrorMessage>{errors.typeSpecify}</FormErrorMessage>
                  </FormControl>
                </Box>
                <Divider width="80%" />

                <Box width={["80%", "60%", "40%"]}>
                  <FormControl>
                    <FormLabel as="h3" fontSize="1.5em">
                      <b>¿Tus actividades se relacionan con los incendios?</b>
                    </FormLabel>
                    <RadioGroup
                      value={values.fireRelated ? "y" : "n"}
                      onChange={({ target: { value } }) => {
                        setFieldValue("fireRelated", value === "y");
                      }}
                    >
                      <Radio value="y" borderColor="grey" variantColor="green">
                        Sí
                      </Radio>
                      <Radio value="n" borderColor="grey" variantColor="green">
                        No
                      </Radio>
                    </RadioGroup>
                  </FormControl>

                  <FormControl
                    isRequired={values.fireRelated}
                    isInvalid={
                      !!(
                        touched.fireRelatedSpecify && errors.fireRelatedSpecify
                      )
                    }
                  >
                    <FormLabel>Especifica</FormLabel>
                    <Input
                      name="fireRelatedSpecify"
                      onChange={handleChange}
                      value={values.fireRelatedSpecify}
                    />
                    <FormErrorMessage>
                      {errors.fireRelatedSpecify}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
                <Divider width="80%" />

                <Stack align="center" width="50%" textAlign="center">
                  <FormControl isInvalid={!!errors.termsAndConditions}>
                    <Checkbox
                      borderColor="grey"
                      isChecked={values.termsAndConditions}
                      onChange={() => {
                        setFieldValue(
                          "termsAndConditions",
                          !values.termsAndConditions
                        );
                      }}
                    >
                      <Text>
                        Acepto los{" "}
                        <a
                          onClick={ev => {
                            ev.preventDefault();
                            onOpen();
                          }}
                        >
                          <b>terminos y condiciones</b>
                        </a>
                      </Text>
                    </Checkbox>
                    <FormErrorMessage>
                      {errors.termsAndConditions}
                    </FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isSubmitting}
                    variantColor="blue"
                    isDisabled={!values.password || !isValid}
                    leftIcon={FaSignInAlt}
                  >
                    Registrarse
                  </Button>
                </Stack>
              </Stack>
            </form>
          );
        }}
      </Formik>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpenTermsAndConditions}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Términos y condiciones</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Términos y condiciones en construcción...</ModalBody>
          <ModalFooter>
            <Button variantColor="blue" mr={3} onClick={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SignUpPage;

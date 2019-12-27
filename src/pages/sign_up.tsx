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
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
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
import { useUser } from "../components/Auth";
import { LoadingPage } from "../components/LoadingPage";
import { CURRENT_USER, SIGN_UP } from "../graphql/queries";
import { userTypeToText } from "../utils/enums";

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
          type: undefined as UserType | undefined,
          typeSpecify: "",
          fireRelated: false,
          fireRelatedSpecify: "",
          termsAndConditions: true,
        }}
        onSubmit={async ({
          email,
          password,
          type,
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
                  type,
                  typeSpecify,
                  fireRelated,
                  fireRelatedSpecify,
                },
              },
            });
          } catch (err) {}
        }}
        validate={({ email, password, termsAndConditions }) => {
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
                  <Heading as="h2" size="lg">
                    ¿A qué te dedicas?
                  </Heading>
                  <RadioGroup
                    value={values.type}
                    onChange={({ target: { value } }) => {
                      setFieldValue("type", value);
                    }}
                  >
                    <Radio
                      variantColor="green"
                      value={UserType.scientificOrAcademic}
                      aria-label="scientific"
                      borderColor="grey"
                    >
                      {userTypeToText(UserType.scientificOrAcademic)}
                    </Radio>
                    <Radio
                      variantColor="green"
                      value={UserType.professional}
                      borderColor="grey"
                    >
                      {userTypeToText(UserType.professional)}
                    </Radio>
                    <Radio
                      variantColor="green"
                      value={UserType.student}
                      borderColor="grey"
                    >
                      {userTypeToText(UserType.student)}
                    </Radio>
                    <Radio
                      variantColor="green"
                      value={UserType.other}
                      borderColor="grey"
                    >
                      {userTypeToText(UserType.other)}
                    </Radio>
                  </RadioGroup>
                </Box>
                <Box width={["80%", "60%", "40%"]}>
                  <FormControl>
                    <FormLabel>Especifica</FormLabel>
                    <Input
                      name="typeSpecify"
                      onChange={handleChange}
                      value={values.typeSpecify}
                    />
                  </FormControl>
                </Box>
                <Divider width="80%" />

                <Box width={["80%", "60%", "40%"]}>
                  <Heading as="h2" size="lg">
                    ¿Tus actividades diarias se relacionan con los incendios?
                  </Heading>
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
                  <FormControl>
                    <FormLabel>Especifica</FormLabel>
                    <Input
                      name="fireRelatedSpecify"
                      onChange={handleChange}
                      value={values.fireRelatedSpecify}
                    />
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

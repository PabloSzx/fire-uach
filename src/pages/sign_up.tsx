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
  Heading,
  Image,
  Input,
  List,
  ListItem,
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
                  <FormControl isInvalid={!!(touched.types && errors.types)}>
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
                      <Radio value="n" borderColor="grey" variantColor="green">
                        No
                      </Radio>

                      <Radio value="y" borderColor="grey" variantColor="green">
                        Sí
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
        size="6xl"
        scrollBehavior="inside"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Términos y condiciones</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image
              alt="UACh"
              src="/uach_logo.jpg"
              width="100%"
              height="100%"
              maxHeight={["100px", "120px", "160", "200px"]}
              objectFit="contain"
            />
            <Heading as="h1" size="xl">
              LICENCIA DE USO DE APLICACIÓN E-NCENDIO
            </Heading>
            <Heading as="h3" size="lg">
              ANTECEDENTES
            </Heading>
            <Text fontSize="lg">
              <b>LA UNIVERSIDAD AUSTRAL DE CHILE</b>, (en adelante e
              indistintamente, “UACh” o la “UNIVERSIDAD”), en el marco del
              proyecto FireSeS, Centro de fuego y resiliencia de
              socioecosistemas, creado el año 2019 con el objetivo de evaluar
              los principales forzantes (drivers), impactos y tendencias del
              régimen de fuego sobre la resiliencia y adaptación de los
              socioecosistemas del centro-sur de Chile bajo un escenario de
              cambio y variabilidad climática, y en el marco del Proyecto
              Fondecyt Regular N. 1190999 “Soil fertility and fire proneness
              across scales”, ha creado la aplicación E-NCENDIO, que tiene como
              objetivo conocer la percepción de la comunidad sobre los incendios
              en forma lúdica. Mientras se juega, los participantes recibirán
              consejos sobre incendios y también puntos para acceder a premios.
            </Text>
            <Heading as="h3" size="lg">
              CLÁUSULAS
            </Heading>
            <Heading as="h4" size="md">
              PRIMERA: OBJETO DEL CONTRATO
            </Heading>
            <Text fontSize="lg">
              La UNIVERSIDAD otorga al usuario, una licencia gratuita de uso
              para utilizar la aplicación E-NCENDIO, mediante el medio
              electrónico en que se encuentre, y toda la documentación
              correspondiente para su operación y uso.
            </Text>
            <Heading as="h3" size="lg">
              SEGUNDA: PROPIEDAD DE LA APLICACIÓN Y ALCANCE DE LA LICENCIA.
            </Heading>
            <Text fontSize="lg">
              El Licenciatario acepta y reconoce que la aplicación E-NCENDIO es
              propiedad de la UNIVERSIDAD, por lo que deberá abstenerse de
              copiar con o sin fines de lucro la aplicación bajo licencia y/o
              distribuirla por otros medios a los establecidos por la
              UNIVERSIDAD. El usuario se compromete a no someter el software a
              procesos de ingeniería inversa, descompilarlo o desensamblarlo,
              salvo en las formas permitidas por la ley aplicable. El usuario no
              debe modificar, adaptar, traducir, alquilar, arrendar, prestar,
              sublicenciar o crear obras derivadas y basadas en el software, ya
              sea total o parcialmente, ni comercializar en ninguna forma la
              aplicación E-NCENDIO.
            </Text>
            <Heading as="h3" size="lg">
              TERCERA: GARANTÍA LIMITADA
            </Heading>
            <Text fontSize="lg">
              Esta aplicación es proporcionada por sus propietarios y
              colaboradores "tal cual". En consecuencia, no se otorga ninguna
              garantía expresa o implícita, incluyendo, pero no limitado a, las
              garantías de comerciabilidad y aptitud para un propósito en
              particular. En ningún caso la UNIVERSIDAD será responsable por
              daños directos, indirectos, incidentales, especiales, ejemplar o
              consecuenciales (incluyendo, pero no limitado a, la adquisición de
              bienes o servicios; pérdida de uso, de datos o de beneficios, o
              interrupción de la actividad), y en cualquier teoría de
              responsabilidad, ya sea en materia de responsabilidad contractual
              o extracontractual que de alguna manera pueda surgir del uso de
              esta aplicación, incluso si se ha advertido de la posibilidad de
              tales daños.
            </Text>
            <Heading as="h3" size="lg">
              CUARTA: RECOPILACIÓN DE DATOS DE USUARIO Y SU USO POR PARTE DE LA
              UNIVERSIDAD
            </Heading>
            <Text fontSize="lg">
              Al utilizar la aplicación E-NCENDIO el usuario acepta que toda la
              información que ingrese o que la aplicación genere automáticamente
              en base a su uso será propiedad de la UNIVERSIDAD, y está podrá
              usarla para los fines que estime convenientes. A continuación se
              detalla la información que recopilará la aplicación E-NCENDIO de
              los usuarios que la utilicen.
            </Text>
            <List as="ol" listStyleType="lower-alpha" fontSize="lg">
              <ListItem>
                Se recopilará la asociación que hagan los usuarios de conceptos
                y de imágenes con conceptos, en el contexto de incendios
                forestales. Tanto los conceptos como las imágenes serán
                provistas por la UNIVERSIDAD.
              </ListItem>
              <ListItem>
                También se recopilarán las fotos que suban los usuarios a la
                aplicación y la asociación que hagan de ellas con los conceptos
                provistos por la UNIVERSIDAD.
              </ListItem>
              <ListItem>
                Se recopilarán datos en cuanto a su ocupación, lugar de
                residencia y su relación con los incendios.
              </ListItem>
              <ListItem>
                Se recopilarán datos en relación a su posición espacial en el
                momento de usar la aplicación.
              </ListItem>
            </List>
            <Heading as="h3" size="lg">
              QUINTA: PREMIO POR USO DE LA APLICACIÓN E-NCENDIO
            </Heading>
            <Text fontSize="lg">
              Al usar la aplicación durante el mes de Febrero de 2020, los
              usuarios podrán ganar una cámara instantánea con más de 100 fotos.
              El ganador será sorteado entre aquellos que más participen de los
              tres juegos que se incluyen en la aplicación, determinado por el
              ranking general que se encuentra en la sección de perfil de
              usuario de la aplicación. El ganador se determinará durante abril
              2020, siendo invitado a recibir su premio en Valdivia.
            </Text>
          </ModalBody>
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

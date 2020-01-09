import { ChangeEvent, useState } from "react";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/core";

export const useOtherCategoryModal = () => {
  const [value, setValue] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [answer, setAnswer] = useState<string>();
  const modal = (
    <>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>¿Qué nos propones?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={value}
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) => {
                if (value.length < 50) {
                  setValue(value);
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              cursor="pointer"
              variantColor="blue"
              onClick={() => {
                setAnswer(value);
                setValue("");
              }}
            >
              Enviar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );

  return {
    open: onOpen,
    close: onClose,
    modal,
    input: value,
    answer,
    restartAnswer: () => setAnswer(undefined),
  };
};

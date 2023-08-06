import {
  Text,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

interface ExplicitModalProps {
  onCloseModal: () => void;
  onClick: () => void;
}

const ExplicitModal = ({ onCloseModal, onClick }: ExplicitModalProps) => (
  <>
    <Modal isOpen={true} onClose={onCloseModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Explicit Link</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            This link has been marked as explicit. Do you want to continue?
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" onClick={onClick}>
            Continue
          </Button>
          <Button variant="ghost" onClick={onCloseModal}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </>
);

export default ExplicitModal;

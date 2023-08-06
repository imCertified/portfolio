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

interface DeleteModalProps {
  onDelete: () => void;
  onCloseModal: () => void;
}

const DeleteModal = ({ onDelete, onCloseModal }: DeleteModalProps) => (
  <>
    <Modal isOpen={true} onClose={onCloseModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Are You Sure?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            This action will delete this link forever. Are you sure?
          </Text>
        </ModalBody>
        <ModalFooter>
        <Button color='red' onClick={onDelete}>
            Delete
          </Button>
          <Button variant="ghost" onClick={onCloseModal}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </>
);

export default DeleteModal;

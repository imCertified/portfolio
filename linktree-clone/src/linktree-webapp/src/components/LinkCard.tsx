import {
  Button,
  Avatar,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { useState } from "react";

interface LinkCardProps {
  displayText: string;
  linkId: string;
  url: string
  isExplicit: boolean;
  user: string;
}

const LinkCard = ({ displayText, linkId, url, isExplicit, user }: LinkCardProps) => {
  const [showModal, setShowModal] = useState(false);

  const openLink = () => {
    // Best effort to track link clicks without interfering with user flow
    fetch(`https://api.linktree.portfolio.mannyserrano.com/track?user=${user}&linkId=${linkId}`, {
      method: 'POST'
    })
    window.open(url, '_blank');
    setShowModal(false);
  }

  return (
    <>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Explicit Link</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>This link has been marked as explicit. Do you want to continue?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='red' onClick={openLink}>Continue</Button>
            <Button variant='ghost' onClick={() => setShowModal(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Width should eventually be bound to the container size */}
      <Button
        bg="red"
        height="55px"
        width="500px"
        borderRadius="100px"
        justifyContent={"space-between"}
        onClick={() => {
          if (isExplicit) {
            setShowModal(true);
          } else {
            openLink();
          }
        }}
      >
        <Avatar
          size="md"
          src="https://ugc.production.linktr.ee/Tn4NDgeFSEav8ZM3zzvZ_Screen%20Shot%202023-06-23%20at%208.47.05%20AM.png"
        ></Avatar>
        <Text color="white">{displayText}</Text>
        <Text></Text>
      </Button>
    </>
  );
};

export default LinkCard;

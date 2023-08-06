import {
  Button,
  Avatar,
  Text,
  IconButton,
  Flex,
  Spacer,
  Icon,
} from "@chakra-ui/react";
import { useState } from "react";
import ExplicitModal from "./ExplicitModal";
import DeleteModal from "./DeleteModal";
import { DeleteIcon } from "@chakra-ui/icons";

interface LinkCardProps {
  displayText: string;
  linkId: string;
  url: string;
  isExplicit: boolean;
  user: string;
  isOwned: boolean;
  onDelete: (linkId: string) => void;
}

const LinkCard = ({
  displayText,
  linkId,
  url,
  isExplicit,
  user,
  isOwned,
  onDelete,
}: LinkCardProps) => {
  const [showExplicitModal, setShowExplicitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const openLink = () => {
    // Best effort to track link clicks without interfering with user flow
    fetch(
      `https://api.linktree.portfolio.mannyserrano.com/track?user=${user}&linkId=${linkId}`,
      {
        method: "POST",
      }
    );
    window.open(url, "_blank");
    setShowExplicitModal(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    onDelete(linkId);
  };

  return (
    <>
      {!isOwned && showExplicitModal && (
        <ExplicitModal
          onClick={openLink}
          onCloseModal={() => setShowExplicitModal(false)}
        ></ExplicitModal>
      )}
      {isOwned && showDeleteModal && (
        <DeleteModal
          onDelete={handleDelete}
          onCloseModal={() => setShowDeleteModal(false)}
        ></DeleteModal>
      )}

      {/* Width should eventually be bound to the container size */}
      <Button
        bg="red"
        height="55px"
        width="500px"
        borderRadius="100px"
        variant="unstyled"
        onClick={() => {
          if (!isOwned) {
            if (isExplicit) {
              setShowExplicitModal(true);
            } else {
              openLink();
            }
          }
        }}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Avatar
            size="md"
            src="https://ugc.production.linktr.ee/Tn4NDgeFSEav8ZM3zzvZ_Screen%20Shot%202023-06-23%20at%208.47.05%20AM.png"
            marginX="10px"
          ></Avatar>
          <Spacer />
          <Text color="white">{displayText}</Text>
          <Spacer />
          {!isOwned && <Text marginX="10px"></Text>}
          {isOwned && (
            <DeleteIcon
              // variant="ghost"
              // isRound={true}
              aria-label="Delete"
              // icon={<DeleteIcon />}
              // colorScheme="white"
              marginX="10px"
              onClick={() => setShowDeleteModal(true)}
            />
          )}
        </Flex>
      </Button>
    </>
  );
};

export default LinkCard;

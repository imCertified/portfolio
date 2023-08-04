import { Button, Avatar, Text } from "@chakra-ui/react";

interface LinkCardProps {
  displayText: string;
  linkId: string;
  isExplicit: boolean;
  user: string;
}

const LinkCard = ({ displayText, linkId, isExplicit, user }: LinkCardProps) => {
  return (
    <>
      {/* Width should eventually be bound to the container size */}
      <Button
        bg="red"
        height="55px"
        width="500px"
        borderRadius="100px"
        justifyContent={"space-between"}
        onClick={() => {
          if (isExplicit) {
            alert("Explicit. Should be modal");
          }
          window.open(
            `https://api.linktree.portfolio.mannyserrano.com/redirect?user=${user}&linkId=${linkId}`,
            "_blank"
          );
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

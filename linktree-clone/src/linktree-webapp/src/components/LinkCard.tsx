import { Card, CardBody, Text, LinkOverlay, LinkBox } from "@chakra-ui/react";

interface LinkCardProps {
  displayText: string;
  linkId: string;
  isExplicit: boolean;
  user: string;
}

const LinkCard = ({ displayText, linkId, isExplicit, user }: LinkCardProps) => {
  return (
    <LinkBox>
    <LinkOverlay href={`https://api.linktree.portfolio.mannyserrano.com/redirect?user=${user}&linkId=${linkId}`}>
      <Card direction="row" background={isExplicit ? 'red' : 'current'}>
        <CardBody>
          <Text>{displayText} - {linkId}</Text>
        </CardBody>
      </Card>
    </LinkOverlay>
    </LinkBox>

  );
};

export default LinkCard;

import { Skeleton } from "@chakra-ui/react";
import useLinks from "../hooks/useLinks";
import { AmplifyUser } from "@aws-amplify/ui";
import LinkCard from "./LinkCard";

interface LinksListProps {
  user: AmplifyUser;
}

const LinksList = ({ user }: LinksListProps) => {
  const { links, error, isLoading, setLinks, setError } = useLinks(user);

  if (isLoading) {
    return (
      <>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
      </>
    );
  }

  return (
    <>
      {links &&
        links.map((link) => {
          return (
            <LinkCard
              displayText={link.displayText}
              linkId={link.linkId}
              isExplicit={link.isExplicit}
              key={link.url}
              user="manny"
            ></LinkCard>
          );
        })}
    </>
  );
};

export default LinksList;

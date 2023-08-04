import { Skeleton } from "@chakra-ui/react";
import useLinks from "../hooks/useLinks";
import { AmplifyUser } from "@aws-amplify/ui";
import LinkCard from "./LinkCard";
import { useParams } from "react-router-dom";

// interface LinksListProps {
//   user: AmplifyUser;
// }

const LinksList = () => {
  const {user} = useParams();
  const { links, error, isLoading, setLinks, setError } = useLinks(user as string);

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
              user={user as string}
            ></LinkCard>
          );
        })}
    </>
  );
};

export default LinksList;

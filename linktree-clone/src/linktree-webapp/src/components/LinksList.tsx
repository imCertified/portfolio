import { Skeleton, VStack } from "@chakra-ui/react";
import LinkCard from "./LinkCard";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "../services/links-service";

interface LinksListProps {
  user: string;
  isOwned: boolean;
}

const LinksList = ({ user, isOwned }: LinksListProps) => {
  const [isLoading, setLoading] = useState(false);
  const [links, setLinks] = useState<Link[] | []>([]);

  useEffect(() => {
    setLoading(true);
    fetchLinks();
  }, []);

  const fetchLinks = () => {
    // Inbuilt fetch is fine for getting the links
    fetch(`https://api.linktree.portfolio.mannyserrano.com/links?user=${user}`)
      .then((response) => {
        return response.json() as Promise<{ links: Link[] }>;
      })
      .then((data) => {
        setLinks(data.links);
        setLoading(false);
      });
  };

  if (isLoading) {
    return (
      <>
        <VStack spacing={4}>
          <Skeleton height="55px" />
          <Skeleton height="55px" />
          <Skeleton height="55px" />
          <Skeleton height="55px" />
        </VStack>
      </>
    );
  }

  return (
    <>
      <VStack spacing={4}>
        {links &&
          links.map((link) => {
            return (
              <LinkCard
                displayText={link.displayText}
                linkId={link.linkId}
                isExplicit={link.isExplicit}
                url={link.url}
                key={link.linkId}
                user={user as string}
              ></LinkCard>
            );
          })}
      </VStack>
    </>
  );
};

export default LinksList;

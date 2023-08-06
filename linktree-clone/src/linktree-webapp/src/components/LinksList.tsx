import { Skeleton, VStack } from "@chakra-ui/react";
import LinkCard from "./LinkCard";
import { AmplifyUser } from '@aws-amplify/ui';
import { useEffect, useState } from "react";
import { Link } from "../services/links-service";

interface LinksListProps {
  user: string;
  isOwned: boolean;
  amplifyUser?: AmplifyUser
}

const baseUrl = 'https://api.linktree.portfolio.mannyserrano.com'

const LinksList = ({ user, isOwned, amplifyUser }: LinksListProps) => {
  const [isLoading, setLoading] = useState(false);
  const [links, setLinks] = useState<Link[] | []>([]);

  useEffect(() => {
    setLoading(true);
    fetchLinks();
  }, []);

  const handleDelete = (linkId: string) => {
    console.log('Handling delete')
    if (isOwned) {
      const requestHeaders: HeadersInit = new Headers();
      requestHeaders.set('Authorization', amplifyUser?.getSignInUserSession()?.getIdToken().getJwtToken() as string)

      fetch(`${baseUrl}/links/${linkId}`, {
        method: 'DELETE',
        headers: requestHeaders
      });

      // Create new object since I have it on good authority that
      // I'm not suppose to change state in place. Then filter out deleted link
      let newLinks = [...links];
      newLinks = newLinks.filter(link => {return link.linkId !== linkId});
      setLinks(newLinks);
    }
  }

  const fetchLinks = () => {
    // Inbuilt fetch is fine for getting the links
    fetch(`${baseUrl}/links?user=${user}`)
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
                isOwned={isOwned}
                onDelete={handleDelete}
              ></LinkCard>
            );
          })}
      </VStack>
    </>
  );
};

export default LinksList;

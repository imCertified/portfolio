import { useEffect, useState } from "react";
import { CanceledError } from "../services/api-client";
import { Link } from "../services/links-service";
import { AmplifyUser } from '@aws-amplify/ui';
import create from "../services/http-service";

interface LinksList {
    links: Link[];
}



const useLinks = (user: AmplifyUser) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);

  const linksService = create('/links', user);

  useEffect(() => {
    setLoading(true);
    const { request, cancel } = linksService.getLinks<LinksList>('manny');
    request
      .then((res) => {
        setLinks(res.data.links);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof CanceledError) {
          return; // If it's canceled, that's because we canceled it with the abortcontroller
        }
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancel();
    };
  }, []);

  return { links, error, isLoading, setLinks, setError };
}

export default useLinks;
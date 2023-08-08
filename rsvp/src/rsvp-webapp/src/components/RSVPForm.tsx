import React, { useState, useEffect } from "react";
import {
  FormControl,
  Button,
  Stack,
  Skeleton,
  VStack,
  RadioGroup,
  Radio,
  Checkbox,
  Text,
  HStack
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";

const RSVPForm = () => {
  const {inviteId} = useParams();
  const [isLoading, setLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);
  const [invite, setInvite] = useState({
    inviteeName: '',
    attending: '',
    plusOne: false,
    allowPlusOne: null
  });

  useEffect(() => {
    setLoading(true);
    fetchInvite();
  }, []);

  const handleAttendingChange = (isAttending: string) => {
    setInvite({
      ...invite,
      attending: isAttending,
      plusOne: isAttending === 'false' ? false : invite.plusOne
    });
  };

  const handlePlusOneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (invite.attending === 'true') {
      setInvite({
        ...invite,
        plusOne: event.target.checked
      });
    }
  };

  const fetchInvite = () => {
    fetch(`https://api.rsvp.portfolio.mannyserrano.com/invite/${inviteId}`)
      .then(response => {
        return response.json()
      })
      .then(data => {
        setInvite({
          ...data,
          attending: data.attending === true ? 'true' : 'false',
          plusOne: data.attending === true ? data.plusOne : false
        });
        setLoading(false);
      })
  }

  const sendRSVP = () => {
    const payload = JSON.stringify({
      ...invite,
      attending: invite.attending === 'true' ? true : false
    })

    setSubmitting(true);
    fetch(`https://api.rsvp.portfolio.mannyserrano.com/invite/${inviteId}`, {method: 'PUT', body: payload})
      .then(response => {
        if (response.status === 200) {
          setSubmitting(false);
          setSubmitted(true);
        }
        return response.json()
      });
  }

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  if (isSubmitted) {
    return (
      <Text>Your RSVP Has Been Received. Thank you!</Text>
    )
  }

  return (
    <>
      <FormControl>
        <VStack spacing={3}>
        <Text fontSize='3xl'>{invite.inviteeName}</Text>
          <RadioGroup onChange={handleAttendingChange} value={invite.attending}>
            <HStack spacing={10}>
              <Radio value='false' size='lg'>Not Attending</Radio>
              <Radio value='true' size='lg'>Attending</Radio>
            </HStack>
          </RadioGroup>
          {(invite.attending === 'true' && invite.allowPlusOne) && (
            <Checkbox size='lg' isChecked={invite.plusOne} onChange={handlePlusOneChange}>Plus One</Checkbox>
          )}
          <Button isLoading={isSubmitting} onClick={sendRSVP} loadingText='Submitting' textColor='#92b4d7' background='whiteAlpha.200'>
            Submit
          </Button>
        </VStack>
      </FormControl>
    </>
  );
};

export default RSVPForm;

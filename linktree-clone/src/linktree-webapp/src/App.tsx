import { Button, Tag } from "@chakra-ui/react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import { AmplifyUser } from "@aws-amplify/ui";
import LinksList from "./components/LinksList";
import config from "./amplifyConfig";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Text } from "@chakra-ui/react";
import AdminView from "./components/AdminView";
import AnonymousView from "./components/AnonymousView";

// TODO: Inject these at build time
Amplify.configure(config);

function App() {
  const components = {
    Header() {
      return (
        <Tag>
          This is simply for signing up for my portfolio and is used throughout
          to scope resources to yourself in my quasi-SaaS portfolio items. All
          authentication is handled by Amazon Cognito.
        </Tag>
      );
    },
  };

  return (
    <BrowserRouter>
    <Routes>
      <Route path='' element={
        <Authenticator
        initialState="signUp"
        loginMechanisms={["username"]}
        variation="modal"
        components={components}
        >
          {({ signOut, user }) => (
            <>
            <AdminView user={user as AmplifyUser}></AdminView>
            <Text>Standin for {user?.username}</Text>
            <Button onClick={signOut}>Signout</Button>
            </>
          )}
        </Authenticator>
      } />
      <Route path=':user' element={
        <AnonymousView></AnonymousView>
      } />
      
    </Routes>
  </BrowserRouter>
    
  );
}

export default App;

import { Tag } from "@chakra-ui/react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import { AmplifyUser } from '@aws-amplify/ui';
import LinksList from "./components/LinksList";

// TODO: Inject these at build time
Amplify.configure({
  aws_project_region: "us-east-1",
  aws_cognito_region: "us-east-1",
  aws_user_pools_id: "us-east-1_KsgCxrSiq",
  aws_user_pools_web_client_id: "5t1gta3iuhc941jj8a0ucgacjq",
  oauth: {
    domain: "auth.linktree.portfolio.mannyserrano.com",
    scope: [
      "phone",
      // "email",
      "openid",
      "profile",
      "aws.cognito.signin.user.admin",
    ],
    redirectSignIn: "http://localhost:5173",
    redirectSignOut: "http://localhost:5173",
    responseType: "token",
  },
  federationTarget: "COGNITO_USER_POOLS",
  aws_cognito_username_attributes: ["username"],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ["USERNAME"],
  // aws_cognito_mfa_configuration: "OPTIONAL",
  aws_cognito_mfa_types: [],
  aws_cognito_password_protection_settings: {
    passwordPolicyCharacters: [
      "REQUIRES_LOWERCASE",
      "REQUIRES_UPPERCASE",
      "REQUIRES_SYMBOLS",
    ],
    passwordPolicyMinLength: 8,
  }
});

function App() {
  const components = {
    Header() {
      return (
        <Tag>This is simply for signing up for my portfolio and is used throughout to scope resources to yourself in my quasi-SaaS portfolio items. All authentication is handled by Amazon Cognito.</Tag>
      )
    }
  };


  return (<Authenticator initialState="signUp" loginMechanisms={['username']} variation="modal" components={components}>
      {({ signOut, user }) => (
          <LinksList user={user as AmplifyUser}></LinksList>
      )}

      
    </Authenticator>
  )

  
}

export default App;

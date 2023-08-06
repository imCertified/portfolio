import LinksList from "./LinksList"
import { AmplifyUser } from '@aws-amplify/ui';

interface AdminViewProps {
    user: AmplifyUser;
}


const AdminView = ({ user }: AdminViewProps) => {
  return (
    <LinksList user={user.username as string} isOwned={true} amplifyUser={user}></LinksList>
  )
}

export default AdminView
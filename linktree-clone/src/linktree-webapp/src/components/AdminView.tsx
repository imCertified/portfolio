import LinksList from "./LinksList"
import { AmplifyUser } from '@aws-amplify/ui';

interface AdminViewProps {
    user: AmplifyUser;
}


const AdminView = ({ user }: AdminViewProps) => {
  return (
    <LinksList isOwned={true} user={user.username as string}></LinksList>
  )
}

export default AdminView
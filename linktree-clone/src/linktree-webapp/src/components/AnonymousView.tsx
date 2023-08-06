import { useParams } from 'react-router-dom';
import LinksList from './LinksList'

const AnonymousView = () => {
  const { user } = useParams();

  return (
    <>
        <LinksList isOwned={false} user={user as string}></LinksList>
    </>
  )
}

export default AnonymousView
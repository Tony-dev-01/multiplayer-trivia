
import { FaCrown } from "react-icons/fa";

const UserListElement = ({user, isHost}) => {
    return <li className="px-4 py-2 border-primary border-2 border-solid">{user.username} {isHost && <FaCrown />}</li>
};

export default UserListElement;
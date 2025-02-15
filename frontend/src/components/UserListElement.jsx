
import { FaCrown } from "react-icons/fa";

const UserListElement = ({user}) => {
    return <li className="px-4 py-2 border-primary border-2 border-solid">{user.username} {user.role === 'subscriber' && <FaCrown />}</li>
};

export default UserListElement;
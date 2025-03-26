
import { FaCrown } from "react-icons/fa";

const PlayerCard = ({user, isHost}) => {
    return <li className="flex gap-4 px-4 py-2 w-full h-auto bg-neutral-content rounded-md break-all text-base/5 items-center">{isHost && <FaCrown />} {user.username} </li>
};

export default PlayerCard;
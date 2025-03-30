
import { FaCrown } from "react-icons/fa";

const PlayerCard = ({user, isHost, isMe}) => {
    return <li className={`flex gap-4 px-4 py-2 w-full h-auto rounded-md break-all text-base/5 items-center ${isMe ? 'bg-primary !text-white' : 'bg-neutral-content'}`}>{isHost && <FaCrown />} {user.username} </li>
};

export default PlayerCard;
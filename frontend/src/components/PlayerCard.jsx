
import { FaCrown } from "react-icons/fa";

const PlayerCard = ({user, isHost, isMe}) => {
    return <li className={`flex gap-4 px-4 py-2 w-full h-auto rounded-md break-all text-base/5 items-center ${isMe ? 'bg-primary text-primary-content' : 'bg-base-100 text-neutral-content'}`}>{user.username} {isHost && <FaCrown />}</li>
};

export default PlayerCard;
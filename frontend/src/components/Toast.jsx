import { FaTimesCircle } from "react-icons/fa";


const Toast = ({toast, onClose}) => {
    console.log(toast)
    const {event, username} = toast;
    return(
    <div role="alert" className="rounded-xl border border-gray-100 p-4 toast toast-end bg-neutral-content z-40">
    <div className="flex items-start gap-4">
        <span className="text-success">
        {event === 'connect' ? <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
        >
            <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg> : <FaTimesCircle className="text-error"/>
        }
        </span>
    
        <div className="flex-1">
        <strong className="block font-medium text-gray-900"> {event === 'connect' ? `User joined`: `User left`} </strong>
    
        <p className="mt-1 text-sm text-gray-700">{event === 'connect' ? `${username} is connected` : `${username} has disconnected.`}</p>
        </div>
    
        <button className="text-gray-500 transition hover:text-gray-600" onClick={onClose}>
        <span className="sr-only">Dismiss popup</span>
    
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        </button>
    </div>
    </div>
    )
};

export default Toast;
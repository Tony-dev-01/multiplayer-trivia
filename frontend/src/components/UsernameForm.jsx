import { useRef, useState } from "react";
import { socket } from "../config/socket";
import { useNavigate } from "react-router-dom";

const UsernameForm = ({handleSubmit, ...props}) => {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    const hasInput = userInput.length > 0;
    
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsLoading(() => true);
    //     const username = userInput;
    //     // const request = await socket.to(userInput).emit('join-room', userInput);
    //     setIsLoading(() => false);
    // };

    return(
        <dialog id="my_modal_1" className="modal" {...props}>
        <div className="modal-box">
            <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-lg">Choose a username</h3>
            <p className="py-4">Enter your username here.</p>
            <form onSubmit={(e) => handleSubmit(e, userInput)} className="flex flex-col gap-2">
            <input
                type="text"
                placeholder="Type here"
                className="input input-bordered input-primary w-full max-w-xs" 
                onChange={(e) => setUserInput(e.target.value)}
                />
                <div className="flex flex-row gap-4">
                <button className={`btn ${hasInput && 'btn-primary'}`} disabled={!hasInput} type="submit">Submit</button>
                {isLoading && <p>loading...</p>}
                </div>
            </form>
        </div>
     </dialog>
        
    )
};

export default UsernameForm;
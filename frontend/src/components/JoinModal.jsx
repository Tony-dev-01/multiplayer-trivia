import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertMessage from "./AlertMessage";
import { numberValidation } from "../App/inputValidation";

import {socket} from "../config/socket";

const JoinModal = () => {
    const [userInput, setUserInput] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const hasInput = userInput.length > 0;
    
    const handleJoinRoom = async (e) => {
        e.preventDefault();
        const gameRoomId = userInput;

        setError(() => '');
        setIsLoading(() => true);
        
        try {
            await numberValidation(Number(userInput));
            
            socket.emit('verify-room', gameRoomId, ( callback) => {
                if (callback.status === 'OK'){
                    // room exists and proceed to join
                    navigate(`/${gameRoomId}`);
                } else if (callback.status === 'ERROR') {
                    // throw new Error(callback.message);
                    setIsLoading(() => false);
                    setError(() => callback.message);
                }
            });
        } catch(err) {
            console.log(err.message)
            setIsLoading(() => false);
            setError(() => err.message);
        }
        
    };

    return(
        <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
            <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-lg">Join a game</h3>
            <p className="py-4">Enter your game code here to join.</p>
            <form onSubmit={handleJoinRoom} className="flex flex-col gap-2">
            <input
                type="number"
                name="game-code"
                placeholder="Type here"
                className="input input-bordered input-primary w-full max-w-xs" 
                onChange={(e) => setUserInput(e.target.value)}
                />
                <div className="flex flex-row gap-4">
                <button className={`btn ${hasInput && 'btn-primary'}`} disabled={!hasInput} type="submit">Join game</button>
                {isLoading && <p>loading...</p>}
                {error.length > 0 && <AlertMessage>{error}</AlertMessage>}
                </div>
            </form>
        </div>
        </dialog>
        
    )
};

export default JoinModal;
import { useEffect, useRef } from "react";
import { socket } from "../config/socket";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AlertMessage from "./AlertMessage";


const Chat = ({username}) => {
    const params = useParams();
    const gameRoomId = params.gameRoomId;
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const chatbox = useRef(null);
    const messagesEnd = useRef(null);

    let isError = errorMessage.length > 0;

    const displayErrorMessage = (callback) => {
        setErrorMessage(() => callback.message);

        const displayTimer = setTimeout(() => {
            setErrorMessage(() => '');
            clearTimeout(displayTimer);
        }, callback.timeRemaining);
    }

    const scrollToBottom = () => {
        messagesEnd.current?.scrollIntoView({behavior: 'smooth'})
    }
    
    useEffect(() => {
        socket.on('receive-message', (message, username) => {
            displayMessage(message, username);
        });

        return () => {
            socket.off('receive-message');
        }
    }, [socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();

        socket.timeout(10000).emit('send-message', gameRoomId, userInput, username, (err, callback) => {
            if (callback.status !== 'OK'){
                if (!isError){
                    displayErrorMessage(callback);
                }
            } else {
                setMessages((prevMessages) => [...prevMessages, {message: callback.message, username: callback.username}]);
            }
            // display err message or callback
        });
        setUserInput(() => '');
        // chatbox.current.value = '';
        chatbox.current.focus();
    };

    const displayMessage = (message, username) => {
        setMessages((prevMessages) => [...prevMessages, {message, username}]);
    };

    return(
        <div className="w-full relative flex flex-col gap-4 h-96 max-h-96 rounded-lg bg-base-300">
        <div className="w-full h-full overflow-y-scroll overflow-x-hidden relative flex flex-col gap-4" >
        {messages.map((message, messageIndex) => {
            return (
                <div key={messageIndex} className={`chat ${message.username !== username ? 'chat-start' : 'chat-end'} w-full`}>
                    <div className="chat-header break-all font-medium">
                        {message.username === username ? 'Me' : message.username}
                        {/* <time className="text-xs opacity-50">2 hours ago</time> */}
                    </div>
                    <div className={`chat-bubble break-all leading-5 font-normal ${message.username !== username ? 'bg-base-100 text-neutral-content' : 'bg-primary text-neutral'}`}>{message.message}</div>
                </div>
            )
        })}
        <div ref={messagesEnd}></div>
        </div>
        <form onSubmit={handleSendMessage} className="flex flex-col gap-2 flex-wrap relative">
            <div className="relative">
                {isError && <AlertMessage type="warning">{errorMessage}</AlertMessage>}
            </div>
            <div className="flex flex-row gap-3 relative">
                <input type="text" value={userInput} placeholder="Type your message..." ref={chatbox} onChange={(e) => setUserInput(e.target.value)} className="rounded-lg px-2 w-full font-light" />
                <button className="btn btn-primary rounded-lg font-normal" disabled={userInput.length === 0}>Send</button>
            </div>
        </form>
        </div>
        
    )
};


export default Chat;
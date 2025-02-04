import { useEffect, useRef } from "react";
import { socket } from "../config/socket";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


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
            if (callback.status === 'ERROR'){
                if (!isError){
                    displayErrorMessage(callback);
                }
            } else if (callback.status === 'OK') {
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
        <div className="w-full h-full relative flex flex-col gap-4">
        <div className="w-full h-full overflow-y-scroll relative flex flex-col gap-4" >
        {messages.map((message, messageIndex) => {
            return (
                <div key={messageIndex} className={`chat ${message.username !== username ? 'chat-start' : 'chat-end'} w-full`}>
                    <div className="chat-header">
                        {message.username === username ? 'Me' : message.username}
                        {/* <time className="text-xs opacity-50">2 hours ago</time> */}
                    </div>
                    <div className={`chat-bubble text-white ${message.username !== username ? 'bg-primary' : 'bg-secondary'}`}>{message.message}</div>
                </div>
            )
        })}
        <div ref={messagesEnd}></div>
        </div>
        <form onSubmit={handleSendMessage} className="flex flex-col gap-2 flex-wrap relative">
            <div className="relative">
                
                <div role="alert" className="flex flex-row gap-2 text-yellow-300">
                {isError && 
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5"> 
                        <path
                        fillRule="evenodd"
                        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                        clipRule="evenodd"
                    />
                    </svg> 
                    <p>
                    {errorMessage}
                    </p>
                </>
                }
                </div>
            </div>
            <div className="flex flex-row gap-2 flex-wrap relative">
            <input type="text" value={userInput} placeholder="Type your message..." ref={chatbox} onChange={(e) => setUserInput(e.target.value)} className="rounded-lg px-2"/>
            <button className="btn btn-primary rounded-lg" disabled={userInput.length === 0}>Send</button>
            </div>
        </form>
        </div>
        
    )
};


export default Chat;
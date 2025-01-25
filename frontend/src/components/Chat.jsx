import { useEffect } from "react";
import { socket } from "../config/socket";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


const Chat = ({username}) => {
    const params = useParams();
    const gameRoomId = params.gameRoomId;
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    

    useEffect(() => {
        socket.on('receive-message', (message, username) => {
            displayMessage(message, username);
        });

        return () => {
            socket.off('receive-message');
        }
    }, [socket]);

    const handleSendMessage = (e) => {
        e.preventDefault();

        setMessages((prevMessages) => [...prevMessages, {message: userInput, username}]);
        socket.timeout(10000).emit('send-message', gameRoomId, userInput, username);
    };

    const displayMessage = (message, username) => {
        setMessages((prevMessages) => [...prevMessages, {message, username}]);
    };

    return(
        <div className="w-full h-full overflow-y-scroll relative">
        {messages.map((message, messageIndex) => {
            return (
                <div key={messageIndex} className={`chat ${message.username !== username ? 'chat-start' : 'chat-end'} h-full max-h-90 overflow-y-scroll`}>
                    <div className="chat-header">
                        {message.username === username ? 'Me' : message.username}
                        {/* <time className="text-xs opacity-50">2 hours ago</time> */}
                    </div>
                    <div className="chat-bubble">{message.message}</div>
                </div>
            )
        })}
        

        <form onSubmit={handleSendMessage} className="">
                <input type="text" value={userInput} placeholder="Type your message..." onChange={(e) => setUserInput(e.target.value)}/>
                <button className="btn btn-primary">Send message</button>
            </form>
        </div>
        
    )
};

export default Chat;
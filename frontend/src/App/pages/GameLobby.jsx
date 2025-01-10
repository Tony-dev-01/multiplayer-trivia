import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "../../config/socket";
import { useParams } from "react-router-dom";

const GameLobby = () => {
    const params = useParams();
    const gameRoomId = params.gameRoomId; // get room id from params
    const [isConnected, setIsConnected] = useState(false);
    const [userIds, setUserIds] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);

    // implement some authentication...
    
    useEffect(() => {
        // join room
        if (isConnected){
            socket.timeout(10000).emit('join-room', gameRoomId, (error, callback) => {
                console.log(callback)
                if (callback.status === 'ok'){
                    setIsConnected(true);
                }
            });
        };
    }, [isConnected])

    useEffect(() => {
        // connect user to socket
        socket.connect();
        setIsConnected(() => true);

        // socket listeners
        socket.on('user-connected', userId => {
            setUserIds((prevIds) => [...prevIds, userId]);
        });

        socket.on('receive-message', message => {
            displayMessage(message);
        });

        return () => {
            // cleanup listeners
            socket.off('user-connected');
            socket.off('receive-message');
            socket.disconnect();
        }
    }, [socket]);

    const handleSendMessage = (e) => {
        e.preventDefault();

        setMessages((prevMessages) => [...prevMessages, userInput]);
        socket.timeout(10000).emit('send-message', gameRoomId, userInput);
    };

    const displayMessage = (message) => {
        console.log('displaying message')
        setMessages((prevMessages) => [...prevMessages, message]);
    }

    return(
        <>
            <p>Welcome to your game lobby!</p>

            <ul>
                {isConnected && <li>You joined the room.</li>}
                {userIds.map((user) => {
                    return <li key={user}>{user} connected</li>
                })}
                {messages.map((message) => {
                    return <li>{message}</li>
                })}
            </ul> 


            <form onSubmit={handleSendMessage}>
                <input type="text" value={userInput} placeholder="Type your message..." onChange={(e) => setUserInput(e.target.value)}/>
                <button className="btn btn-primary">Send message</button>
            </form>
        </>
    )
};

export default GameLobby;
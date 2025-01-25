import { useEffect, useState, } from "react";
import { socket } from "../../config/socket";
import {  useParams } from "react-router-dom";
import { createPortal } from 'react-dom';
import Toast from "../../components/Toast";
import Chat from "../../components/Chat";
import UserListElement from "../../components/UserListElement";
import UsernameForm from "../../components/UsernameForm";

const GameLobby = () => {
    const params = useParams();
    const gameRoomId = params.gameRoomId; // get room id from params
    const [isConnected, setIsConnected] = useState(false);
    const [roomUsers, setRoomUsers] = useState(['']);
    const [openToast, setOpenToast] = useState(false);
    const [usernameSelected, setUsernameSelected] = useState(false);

    let newUserJoining = roomUsers[roomUsers.length - 1].username || undefined;

    const onUsernameSelection = (e, username) => {
        e.preventDefault();
        const role = 'subscriber';
        sessionStorage.setItem('username', username); // store username in session storage 
        sessionStorage.setItem('role', role); // store role in session storage 
        setUsernameSelected(() => true);
        socket.auth = { username, role };
        socket.connect();
        setIsConnected(() => true);
    };

    
    useEffect(() => {
        // grab existing username from session storage on load
        if (sessionStorage.getItem('username')){
            const username = sessionStorage.getItem('username')
            setUsernameSelected(() => true);
            socket.auth = { username };
            socket.connect();
            setIsConnected(() => true);
        }

        return () => {
            socket.disconnect();
        }
    }, [])

    // Display toast when new user joins
    useEffect(() => {
        const timer = setTimeout(() => {
            setOpenToast(() => false);
            clearTimeout(timer);
        }, 5000)

        return () => {
            clearTimeout(timer);
        }
    }, [openToast])


    useEffect(() => {
        // get list of room users when there's a new connection
        // socket.on('room-users', (updatedRoomUsers) => {
        //     setRoomUsers(() => updatedRoomUsers);
        // });

        socket.on("connect_error", (err) => {
            if (err.message === "invalid username") {
                setUsernameSelected(() => false);
                console.log(err.message)
                // ... handle error
            }
        });

        socket.on('user-connected', (roomUsers) => {
            console.log('running')
            setRoomUsers(() => roomUsers); // get updated list of users on new connection
            setOpenToast(() => true); // display the notification
        });

        return () => {
            // cleanup listeners
            socket.off('user-connected');
            socket.off('connect_error');
        }
    }, [socket]);

    useEffect(() => {
        // join room on connection
        if (isConnected){
            console.log('emit')
            socket.timeout(10000).emit('join-room', gameRoomId, (error, callback) => {
            setRoomUsers(() => callback.roomUsers); // Get initial list of room users when joining a room
            });
        };
    }, [isConnected])

    return(
        <div className="w-full h-full"> 
        <UsernameForm handleSubmit={onUsernameSelection} open={!isConnected} />
        {isConnected && usernameSelected &&
        <>
            {openToast && createPortal(
                <Toast title="User joined" message={ newUserJoining === sessionStorage.username ? 'You joined the room.' : newUserJoining + ' joined the room.'} />
            , document.getElementById('toast'))
            }

            <h1 className="font-2xl">Welcome to your game lobby!</h1>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
                <div className="h-32 rounded-lg bg-gray-700 lg:col-span-2">
                    {/* Lobby info displayed here */}
                    <ul>
                        {roomUsers && roomUsers.map((user) => {
                            return <UserListElement key={user.username}>{user.username}</UserListElement>
                        })}
                    </ul>
                </div>
                <div className="h-32 rounded-lg bg-gray-700">
                    {/* Chat display here */}
                    <Chat username={sessionStorage.getItem('username')} />
                </div>
            </div>

            
            </>
        }
        </div>
    )
};

export default GameLobby;
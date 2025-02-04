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
    const username = sessionStorage.getItem('username') || undefined;
    const [isConnected, setIsConnected] = useState(false);
    const [roomUsers, setRoomUsers] = useState(['']);
    const [openToast, setOpenToast] = useState(false);
    const [usernameSelected, setUsernameSelected] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // const toastEventType = newUserJoining ? 'User joined' : 'User disconnected';
    // const toastMessage =  newUserJoining === sessionStorage.username ? 'You joined the room.' : newUserJoining + ' joined the room.'
    
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
            socket.disconnect(gameRoomId, sessionStorage.getItem('username'));
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

        socket.on('user-connected', (username, roomUsers) => {
            setToastMessage(() => `${username} has joined`);
            setRoomUsers(() => roomUsers); // get updated list of users on new connection
            setOpenToast(() => true); // display the notification
        });

        socket.on('user-disconnected', username => {
            setToastMessage(() => `${username} has disconnected`);
            setOpenToast(() => true);
        });

        return () => {
            // cleanup listeners
            socket.off('user-connected');
            socket.off('connect_error');
            socket.off('user-disconnected');
        }
    }, [socket]);

    useEffect(() => {
        // join room on connection
        if (isConnected){
            socket.timeout(10000).emit('join-room', gameRoomId, username, (error, callback) => {
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
                <Toast title="User joined" message={toastMessage || 'undefined'} />
            , document.getElementById('toast'))
            }

            <h1 className="font-2xl">Welcome to your game lobby!</h1>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
                <div className="h-32 rounded-lg bg-gray-700 lg:col-span-2 p-6">
                    {/* Lobby info displayed here */}
                    <ul>
                        {roomUsers && roomUsers.map((user) => {
                            return <UserListElement key={user.username}>{user.username}</UserListElement>
                        })}
                    </ul>
                </div>
                <div className="h-96 max-h-96 rounded-lg bg-gray-700 p-6">
                    {/* Chat display here */}
                    <Chat username={username} />
                </div>
            </div>

            
            </>
        }
        </div>
    )
};

export default GameLobby;
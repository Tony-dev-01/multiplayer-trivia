import { useEffect, useState, } from "react";
import { socket } from "../../config/socket";
import {  useNavigate, useParams } from "react-router-dom";
import { createPortal } from 'react-dom';
import Toast from "../../components/Toast";
import Chat from "../../components/Chat";
import UserListElement from "../../components/UserListElement";
import UsernameForm from "../../components/UsernameForm";
import Dropdown from "../../components/Dropdown";
import AlertMessage from "../../components/AlertMessage";

const GameLobby = () => {
    const params = useParams();
    const gameRoomId = params.gameRoomId; // get room id from params
    const username = sessionStorage.getItem('username') || undefined;
    const [isConnected, setIsConnected] = useState(false);
    const [roomUsers, setRoomUsers] = useState(['']);
    const [openToast, setOpenToast] = useState(false);
    const [usernameSelected, setUsernameSelected] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [gameSettings, setGameSettings] = useState({});
    const [errorMessage, setErrorMessage] = useState(undefined);
    const navigate = useNavigate();
    // const response = UseFetchApi('/game');

    // const toastEventType = newUserJoining ? 'User joined' : 'User disconnected';
    // const toastMessage =  newUserJoining === sessionStorage.username ? 'You joined the room.' : newUserJoining + ' joined the room.'
    
    const onUsernameSelection = async (e, username) => {
        e.preventDefault();
        const role = 'subscriber';
        sessionStorage.setItem('username', username); // store username in session storage 
        sessionStorage.setItem('role', role); // store role in session storage 
        
        try {
            const request = await fetch(`http://localhost:4000/${gameRoomId}/user`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({gameRoomId, username})
            });

            const response = await request.json();

            console.log(response);
            socket.auth = { username };
            socket.connect();
            setUsernameSelected(() => true);
            setIsConnected(() => true);
        } catch(err){
            console.log(err.message)
        }
    };

    const handleSelection = (e) => {
        const setting = e.target.id.toLowerCase();
        const value = e.target.value.replaceAll(" ", '_').toLowerCase();

        const newSettings = {...gameSettings, [setting]: value}
        setGameSettings(() => newSettings)
    };

    const handleStartGame = async (e) => {
        e.preventDefault()
        if (Object.keys(gameSettings).length === 3 && !Object.values(gameSettings).includes('-')) {
            setErrorMessage(() => undefined)
            console.log('game starting...')
            socket.timeout(10000).emit('start-game', gameRoomId, username, gameSettings.category, gameSettings.difficulty, gameSettings.questions);
        } else {
            setErrorMessage(() => 'Please select game options.')
        }
    };

    
    useEffect(() => {
        const createNewUser = async () => {
            try {
                // grab existing username from session storage on load
                if (sessionStorage.getItem('username')){
                    const username = sessionStorage.getItem('username')
                    setUsernameSelected(() => true);

                    // const request = await fetch(`http://localhost:4000/${gameRoomId}/user`, {
                    //     method: 'PUT',
                    //     headers: {
                    //         'Accept': 'application/json',
                    //         'Content-type': 'application/json'
                    //     },
                    //     body: JSON.stringify({gameRoomId, username})
                    // });

                    // const response = await request.json();


                    socket.auth = { username };
                    socket.connect();
                    setIsConnected(() => true);
                } else {
                    return;
                }
            } catch(err){
                console.log(err.message)
            }
        }

        createNewUser();

        // Disconnect any users that are leaving the page
        // return () => {
        //     socket.disconnect(gameRoomId, sessionStorage.getItem('username'));
        // }
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

        socket.on('starting-game', gameURL => {
            navigate(`${gameURL}`);
        })

        return () => {
            // cleanup listeners
            socket.off('user-connected');
            socket.off('connect_error');
            socket.off('user-disconnected');
            socket.off('starting-game');
        }
    }, [socket]);

    useEffect(() => {
        // join room on connection
        if (isConnected){
            socket.timeout(10000).emit('join-room', gameRoomId, username, (error, callback) => {
            setRoomUsers(() => callback.roomUsers || []); // Get initial list of room users when joining a room
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

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8 h-full">
                <div className="h-full rounded-lg bg-gray-700 lg:col-span-2 p-6">
                    <div className="flex flex-row gap-6">
                        {/* Users connected to lobby */}
                        <ul className="flex flex-col gap-3">
                            {roomUsers && roomUsers.map((user) => {
                                return <UserListElement key={user.username} user={user}/>
                            })}
                        </ul>
                        <form className="flex flex-col gap-4" onSubmit={handleStartGame}>
                        <div className="flex flex-row gap-4">
                            <Dropdown name="category" id="category" onSelection={handleSelection} options={["random", "music", "sport and leisure", "film and tv", "arts and literature", "history", "society and culture", "science", "geography", "food and drink", "general knowledge"]}>Category</Dropdown>
                            <Dropdown name="difficulty" id="difficulty" onSelection={handleSelection} options={['Easy', 'Medium', 'Hard']}>Difficulty</Dropdown>
                            <Dropdown name="questions" id="questions" onSelection={handleSelection} options={['10', '15', '20', '25']}>Number of questions</Dropdown>
                        </div>
                        <div>
                        <button type="submit" className="btn btn-primary">Start game</button>
                        {errorMessage && <AlertMessage type='warning'>{errorMessage}</AlertMessage>}
                        </div>
                        </form>
                    </div>
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
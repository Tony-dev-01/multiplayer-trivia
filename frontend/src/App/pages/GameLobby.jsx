import { useEffect, useState, } from "react";
import { socket } from "../../config/socket";
import {  useNavigate, useParams } from "react-router-dom";
import { createPortal } from 'react-dom';
import Toast from "../../components/Toast";
import Chat from "../../components/Chat";
import UsernameForm from "../../components/UsernameForm";
import Dropdown from "../../components/Dropdown";
import AlertMessage from "../../components/AlertMessage";
import PlayerCard from "../../components/PlayerCard";
import Game from "./Game";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { FaUsers, FaComments } from "react-icons/fa";



const GameLobby = () => {
    const params = useParams();
    const gameRoomId = params.gameRoomId; // get room id from params
    const username = sessionStorage.getItem('username') || undefined;
    const [isConnected, setIsConnected] = useState(false);
    const [roomUsers, setRoomUsers] = useState(['']);
    const [openToast, setOpenToast] = useState(false);
    const [usernameSelected, setUsernameSelected] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [toast, setToast] = useState({});
    const [gameSettings, setGameSettings] = useState({questions: 10});
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [gameIsStarting, setGameIsStarting] = useState(false);
    const [gameHasStarted, setGameHasStarted] = useState(false);
    const isHost = username ? roomUsers[0].username === username : null;
    const navigate = useNavigate();
    
    const onUsernameSelection = async (e, username) => {
        e.preventDefault();
        sessionStorage.setItem('username', username); // store username in session storage 
        
        try {
            socket.auth = { username, gameRoomId };
            socket.connect();
            setUsernameSelected(() => true);
            setIsConnected(() => true);
        } catch(err){
        }
    };

    const handleSelection = (e) => {
        const setting = e.target.id.toLowerCase();
        const value = e.target.value.replaceAll(" ", '_').toLowerCase();

        const newSettings = {...gameSettings, [setting]: value}
        setGameSettings(() => newSettings)
    };

    const handleStartGame = async (e) => {
        e.preventDefault();
        if (Object.keys(gameSettings).length === 3 && !Object.values(gameSettings).includes('-')) {
            setErrorMessage(() => undefined)
            socket.timeout(10000).emit('start-game', gameRoomId, username, gameSettings.category, gameSettings.difficulty, gameSettings.questions);
        } else {
            setErrorMessage(() => 'Please select game options.')
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(gameRoomId);
        setCodeCopied(true);
        const delay = setTimeout(() => {
            setCodeCopied(false);
            clearTimeout(delay);
        }, 12000)
    };

    const handleToastClose = () => {
        setToast({});
        setOpenToast(false);
    }

    useEffect(() => {
        const createNewUser = async () => {
            try {
                // grab existing username from session storage on load
                if (sessionStorage.getItem('username')){
                    const username = sessionStorage.getItem('username')
                    setUsernameSelected(() => true);
                    socket.auth = { username, gameRoomId };
                    socket.connect();
                    setIsConnected(() => true);
                } else {
                    return;
                }
            } catch(err){
            }
        }

        createNewUser();

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
            const newToast = {event: 'connect', username};
            setToast(() => newToast);
            setRoomUsers(() => roomUsers); // get updated list of users on new connection
            setOpenToast(() => true); // display the notification
        });

        socket.on('user-disconnected', (username, roomUsers) => {
            const newToast = {event: 'disconnect', username};
            setToast(() => newToast);
            setOpenToast(() => true);
            // Update list of users
            setRoomUsers(() => roomUsers);
        });

        socket.on('start-countdown', (countdown, gameURL) => {
            setGameIsStarting(() => true);
            const preparationTime = setTimeout(() => {
                // navigate(`${gameURL}`);
                setGameHasStarted(true);
                clearTimeout(preparationTime);
            }, countdown);
        });


        return () => {
            // cleanup listeners
            socket.off('user-connected');
            socket.off('connect_error');
            socket.off('user-disconnected');
            socket.off('start-countdown');
            socket.disconnect();
        }
    }, [socket]);

    useEffect(() => {
        // join room on connection
        const joinRoom = async () => {
            if (isConnected){
                try {
                    await socket.timeout(10000).emit('join-room', gameRoomId, username, (error, callback) => {
                        setRoomUsers(() => callback.roomUsers || []); // Get initial list of room users when joining a room
                    });
                } catch(err) {
                    navigate('/');
                }
            };
        };

        joinRoom();

        return () => {
            socket.off('join-room');
        }
    }, [isConnected])

    return(
        <div className="w-full h-full flex justify-center py-12"> 
        <div className="container p-6 flex flex-col gap-6">
        <UsernameForm handleSubmit={onUsernameSelection} open={!isConnected} />
        {isConnected && usernameSelected && !gameHasStarted ?
        <>
            {openToast && createPortal(
                <Toast toast={toast} onClose={handleToastClose} />
            , document.getElementById('toast'))
            }

            <div className="flex flex-col gap-4 justify-center">
                <h1 className="text-2xl text-red-200">Welcome to the game, {username}.</h1>
                <div className="flex flex-col gap-2">
                    <p>game code</p> 
                    
                    <div className="flex gap-2 items-center p-2 bg-base-300 w-fit rounded-lg">
                    <p className="input input-md font-700 text-black bg-transparent flex justify-start items-center font-medium text-xl tracking-wider pl-2">{gameRoomId}</p>
                <div className="lg:tooltip" data-tip={codeCopied ? "Copied!" : "Copy"}>
                    <button className="btn w-16" onClick={handleCopy}>{codeCopied ? <IoCheckmarkCircleOutline className="text-success" size="2em"/> : "Copy"}</button>
                </div>
                </div>
            </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8 h-full">
                <div className="h-auto rounded-lg  lg:col-span-2 p-6 bg-base-200">
                    <div className="flex flex-row gap-6 flex-wrap w-full flex-auto">
                        <div className="flex flex-col gap-4 flex-wrap ">
                        {/* Users connected to lobby */}
                        <h2 id="list-title" className="flex gap-2"><FaUsers /> 
                        Players</h2>
                        <ul aria-labelledby="list-title" className="flex flex-col gap-3 max-w-48">
                            {roomUsers && roomUsers.map((user, index) => {
                                return <PlayerCard key={user.username} user={user} isHost={index === 0} isMe={user.username === username}/>
                            })}
                        </ul>
                        {gameIsStarting &&
                        <div className="flex flex-row align-center gap-3"><span className="loading loading-spinner loading-sm"></span> Game is starting
                        </div>
                        }
                        </div>
                        {isHost ?
                        <form className="flex flex-col gap-4 w-full flex-1" onSubmit={handleStartGame}>
                        <div className="flex flex-row gap-4 flex-wrap w-full">
                            <Dropdown name="category" id="category" onSelection={handleSelection} options={["music", "sport and leisure", "film and tv", "arts and literature", "history", "society and culture", "science", "geography", "food and drink", "general knowledge"]}>Category</Dropdown>
                            <Dropdown name="difficulty" id="difficulty" onSelection={handleSelection} options={['Easy', 'Medium', 'Hard']}>Difficulty</Dropdown>
                        </div>
                        <div>
                        <button type="submit" className="btn btn-primary font-normal">Start game</button>
                        {errorMessage && <AlertMessage type='warning'>{errorMessage}</AlertMessage>}
                        </div>
                        </form>
                        :
                        <p className="pt-8">Waiting for host to start...</p>
                    }
                    </div>
                </div>
            <div className="h-auto rounded-lg  lg:col-span-1 p-6 bg-base-200">
                <div className="collapse collapse-arrow border border-base-300 bg-base-300">
                    {/* Chat display here */}
                    <input type="checkbox" name="my-accordion-2" defaultChecked />
                    <div className="collapse-title flex items-center gap-4">
                    <FaComments /> Chat
                    </div>
                    <div className="collapse-content">
                        <Chat username={username} />
                    </div>
                </div>
                </div>
            </div>
            </> :
            <Game />
        }
        </div>
        </div>
    )
};
export default GameLobby;

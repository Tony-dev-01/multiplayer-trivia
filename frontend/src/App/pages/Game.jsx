import { useCallback, useEffect, useState, useRef } from "react";
import { socket } from "../../config/socket";
import { useParams, useSearchParams } from "react-router-dom";
import Countdown from "../../components/Countdown";
import Scoreboard from "../../components/Scoreboard";


const Game = () => {
    const params = useParams();
    const gameRoomId = params.gameRoomId; // get room id from params
    const [searchParams] = useSearchParams();
    const categories = searchParams.get('categories');
    const difficulties = searchParams.get('difficulties');
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [currentScore, setCurrentScore] = useState(0);
    const [timer, setTimer] = useState(false);
    const [timeUp, setTimeUp] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(10);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [displayScoreboard, setDisplayScoreboard] = useState(false);
    const [usersScore, setUsersScore] = useState([]);
    const questionTimer = 10;
    const timeout = timeRemaining === 0;
    const gameHasStarted = Object.values(currentQuestion).length > 0;
    const username = sessionStorage.getItem('username');
    const hasAnswered = selectedAnswer !== '';
    const hasCorrectAnswer = correctAnswer === selectedAnswer;

    useEffect(() => {
        let countdown;
        if (timer){
        countdown = setInterval(() => {
                setTimeRemaining(prevTime => {
                    const newTime = prevTime - 1;
                    
                    // Check here with the latest time value
                    if (newTime <= 0) {
                        clearInterval(countdown);
                        // handleTimeout(); // closing issue
                    }
                    
                    return newTime;
                });
        }, 1000);
        };


        return () => {
            clearInterval(countdown);
        }
    }, [timer]);

    useEffect(() => {
        if (timeRemaining <= 0) {
            handleTimeout();
        }
    }, [timeRemaining])
    

    useEffect(() => {
        socket.on('new-question', (question) => {
            setCurrentQuestion(() => question);
            setSelectedAnswer(() => '');
            setTimer(() => true);
            setTimeUp(() => false);
            setDisplayScoreboard(() => false);
            console.log(question);
        });

        socket.on('scoreboard', (usersScore) => {
            // display scoreboard
            setSelectedAnswer('');
            setUsersScore(usersScore);
            setTimeRemaining(questionTimer);
            setDisplayScoreboard(() => true);
            console.log('displaying scoreboard')
        });

        return () => {
            socket.off('new-question');
            socket.off('scoreboard');
        }
    }, [socket]);

    const highlightAnswers = (answer) => {
        // return color based on if answer is correct, selected or is false
        if (correctAnswer === answer){
            if (selectedAnswer === correctAnswer){
                // User got it right and this is the correct answer
                return 'disabled:bg-green-300';
            } else {
                // user got it wrong, but this is the correct answer
                return 'disabled:bg-blue-300';
            }
        } else if (answer !== correctAnswer){
            if (answer === selectedAnswer){
                // user selected this answer, but they were wrong
                return 'disabled:bg-red-300';
            } else {
                // user did not select this answer and this is not the correct answer
                return 'disabled:bg-gray-200';
            }
        }
    }

    const verifyAnswer = async (answer) => {
        // send answer to backend
        // backend calculates the score and stores it in DB
        socket.timeout(10000).emit('user-answer', {gameRoomId, username, answer: {...answer}}, (err, callback) => {
            console.log(callback);
            setCorrectAnswer(callback.correctAnswer);
        })
    };

    const handleAnswer = (e) => {
        e.preventDefault();
        if (e.target.value !== undefined){
            setSelectedAnswer(() => e.target.value);
            verifyAnswer({answer: e.target.value, timeRemaining, questionId: currentQuestion.id});
        };
    };

    const handleTimeout = () => {
        // send answer to server 
        if (selectedAnswer === ''){
            verifyAnswer({answer: undefined, timeRemaining: 0, questionId: currentQuestion.id});
        };

        setTimeUp(() => true);
        setTimer(() => false);

    }

    return(
        <div className="w-[80vw] h-[100vh] m-auto py-16 flex flex-col justify-center items-center">
            {gameHasStarted ? 
                displayScoreboard ?
                    <Scoreboard usersScore={usersScore} /> :
            <>
            <span className="countdown font-mono text-6xl">
            {timeUp && hasCorrectAnswer ? 'good job' : timeUp && !hasCorrectAnswer ? 'you got it wrong' : <span style={{"--value": timeRemaining}}></span>}
            </span>
            
            <form className="flex flex-col gap-4 w-full h-full" onClick={handleAnswer}>
            <h2 className="text-2xl font-bold">{currentQuestion.question.text}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-4">
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer === currentQuestion.answers[0] ? 'disabled:bg-secondary' : 'disabled:bg-gray-400'} ${timeUp && highlightAnswers(currentQuestion.answers[0])}`} disabled={timeout || hasAnswered} value={currentQuestion.answers[0]}>{currentQuestion.answers[0]}</button>
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer === currentQuestion.answers[1] ? 'disabled:bg-secondary' : 'disabled:bg-gray-400'} ${timeUp && highlightAnswers(currentQuestion.answers[1])}`} disabled={timeout || hasAnswered} value={currentQuestion.answers[1]}>{currentQuestion.answers[1]}</button>
            </div>
    
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-4">
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer === currentQuestion.answers[2] ? 'disabled:bg-secondary' : 'disabled:bg-gray-400'} ${timeUp && highlightAnswers(currentQuestion.answers[2])}`} disabled={timeout || hasAnswered} value={currentQuestion.answers[2]}>{currentQuestion.answers[2]}</button>
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer === currentQuestion.answers[3] ? 'disabled:bg-secondary' : 'disabled:bg-gray-400'} ${timeUp && highlightAnswers(currentQuestion.answers[3])}`} disabled={timeout || hasAnswered} value={currentQuestion.answers[3]}>{currentQuestion.answers[3]}</button>
            </div>
    
            </form>
            </>
            : 
            <p>Waiting for game to start...</p>
            }
        </div>
    )
}; 

export default Game;
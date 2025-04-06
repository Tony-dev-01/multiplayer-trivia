import { useCallback, useEffect, useState, useRef } from "react";
import { socket } from "../../config/socket";
import { useParams, useSearchParams } from "react-router-dom";
import Countdown from "../../components/Countdown";
import Scoreboard from "../../components/Scoreboard";
import FinalScore from "../../components/FinalScore";


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
    const [gameIsOver, setGameIsOver] = useState(false);
    const [usersScores, setUsersScores] = useState([]);
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

        socket.on('scoreboard', (scores, questionsRemaining) => {
            // display scoreboard
            console.log(scores, questionsRemaining)
            setSelectedAnswer('');
            setUsersScores({scores, questionsRemaining});
            setTimeRemaining(questionTimer);
            setDisplayScoreboard(() => true);
        });

        socket.on('game-over', (finalScores, questionsRemaining) => {
            setUsersScores({scores: finalScores, questionsRemaining})
            setGameIsOver(true);
            console.log('display final score');
        })

        return () => {
            socket.off('new-question');
            socket.off('scoreboard');
            socket.off('game-over');
        }
    }, [socket]);

    const highlightAnswers = (answer) => {
        // return color based on if answer is correct, selected or is false
        if (correctAnswer === answer){
            if (selectedAnswer == correctAnswer){
                // User got it right and this is the correct answer
                return 'disabled:bg-success';
            } else {
                // user got it wrong, but this is the correct answer
                return 'disabled:bg-info';
            }
        } else if (answer !== correctAnswer){
            if (answer === selectedAnswer){
                // user selected this answer, but they were wrong
                return 'disabled:bg-error';
            } else {
                // user did not select this answer and this is not the correct answer
                return 'disabled:bg-base-300';
            }
        }
    }

    const verifyAnswer = async (answer) => {
        // send answer to server
        // server calculates the score and returns it
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
        if (selectedAnswer === ''){
            verifyAnswer({answer: undefined, timeRemaining: 0, questionId: currentQuestion.id});
        };

        // delay to get the timer to 0
        const delay = setTimeout(() => {
            setTimeUp(() => true);
            setTimer(() => false);
            clearTimeout(delay);
        }, 1500);


    }

    return(
        <div className="w-full h-[100vh] m-auto flex flex-col justify-center items-center">
            {gameHasStarted ? 
                displayScoreboard ?
                    <Scoreboard usersScores={usersScores} /> :
                    gameIsOver ? 
                    <FinalScore usersScores={usersScores} gameRoomId={gameRoomId}/>
                    :
            <div className="flex flex-col gap-4 justify-center items-center w-[80vw]">
            <span className="countdown text-6xl">
            {timeUp && hasCorrectAnswer ? 'Good job!' : timeUp && !hasCorrectAnswer ? 'Wrong answer.' : <span style={{"--value": timeRemaining}}></span>}
            </span>
            
            <form className="flex flex-col gap-6 w-full h-full" onClick={handleAnswer}>
            <h2 className="text-2xl font-semi">{currentQuestion.question.text}</h2>
            <div className="flex flex-col gap-4 w-full h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-4">
                <button type="button" className={`h-32 rounded-lg bg-secondary text-neutral flex justify-center items-center px-6 hover:bg-primary ${selectedAnswer === currentQuestion.answers[0] && !timeUp ? 'disabled:bg-primary' : !timeUp ? 'disabled:bg-base-300' : ''} ${timeUp && highlightAnswers(currentQuestion.answers[0])}`} disabled={timeUp || hasAnswered} value={currentQuestion.answers[0]}>{currentQuestion.answers[0]}</button>
                <button type="button" className={`h-32 rounded-lg bg-secondary text-neutral flex justify-center items-center px-6 hover:bg-primary  ${selectedAnswer === currentQuestion.answers[1] && !timeUp ? 'disabled:bg-primary' : !timeUp ? 'disabled:bg-base-300' : ''} ${timeUp && highlightAnswers(currentQuestion.answers[1])}`} disabled={timeUp || hasAnswered} value={currentQuestion.answers[1]}>{currentQuestion.answers[1]}</button>
            </div>
    
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-4">
                <button type="button" className={`h-32 rounded-lg bg-secondary text-neutral flex justify-center items-center px-6 hover:bg-primary ${selectedAnswer === currentQuestion.answers[2] && !timeUp ? 'disabled:bg-primary' : !timeUp ? 'disabled:bg-base-300' : ''} ${timeUp && highlightAnswers(currentQuestion.answers[2])}`} disabled={timeUp || hasAnswered} value={currentQuestion.answers[2]}>{currentQuestion.answers[2]}</button>
                <button type="button" className={`h-32 rounded-lg bg-secondary text-neutral flex justify-center items-center px-6 hover:bg-primary  ${selectedAnswer === currentQuestion.answers[3] && !timeUp ? 'disabled:bg-primary' : !timeUp ? 'disabled:bg-base-300' : ''} ${timeUp && highlightAnswers(currentQuestion.answers[3])}`} disabled={timeUp || hasAnswered} value={currentQuestion.answers[3]}>{currentQuestion.answers[3]}</button>
            </div>
            </div>
            </form>
            </div>
            : 
            <p>Waiting for game to start...</p>
            }
        </div>
    )
}; 

export default Game;
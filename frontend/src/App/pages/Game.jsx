import { useEffect, useState } from "react";
import { socket } from "../../config/socket";
import { useParams, useSearchParams } from "react-router-dom";
import Countdown from "../../components/Countdown";

const Game = () => {
    const params = useParams();
    const gameRoomId = params.gameRoomId; // get room id from params
    const [searchParams] = useSearchParams();
    const categories = searchParams.get('categories');
    const difficulties = searchParams.get('difficulties');
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [selectedAnswer, setSelectedAnswer] = useState(undefined);

    const gameHasStarted = Object.values(currentQuestion).length > 0;

    useEffect(() => {
        socket.on('receive-question', (question) => {
            setCurrentQuestion(() => question);
            setSelectedAnswer(() => '');
            console.log(question);
        });

        socket.on('score-update', (score) => {
            // display scoreboard
        });

        return () => {
            socket.off('receive-question');
        }
    }, [socket]);

    const verifyAnswer = async () => {
        // send answer to backend
        // backend calculates the score and stores it in DB
        try {
            const request = await fetch('http://localhost:4000/:gameRoomId', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(selectedAnswer)
            });

            const response = await request.json();

            if (response.status === 201){
                // request successful
            }
        } catch(err) {
            console.log(err);
        }
    }


    const handleAnswer = (e) => {
        e.preventDefault();
        console.log(e.target.value);
        setSelectedAnswer(() => ({gameRoomId, answer: e.target.value, timeRemaining: 10}));
        verifyAnswer();
        // dispatchEvent(new Event('submit'));
    };

    const handleTimeout = () => {
        console.log('time ran out.');
        // send selectedAnswer to server 
        socket.timeout(10000).emit('send-answer', selectedAnswer);
    }

    return(
        <div className="w-[80vw] h-[100vh] m-auto py-16 flex flex-col justify-center items-center">
            {gameHasStarted ? 
            <>
            <Countdown counterLength={5} reset={setCurrentQuestion} onTimeout={handleTimeout}/>
            <form className="flex flex-col gap-4 w-full h-full" onClick={handleAnswer}>
            <h2 className="text-2xl font-bold">{currentQuestion.question.text}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-4">
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer.answer === currentQuestion.answers[0] ? 'disabled:bg-secondary' : 'disabled:bg-gray-400'}`} disabled={selectedAnswer.length > 0} value={currentQuestion.answers[0]}>{currentQuestion.answers[0]}</button>
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer.answer === currentQuestion.answers[1] ? 'disabled:bg-secondary' : 'disabled:bg-gray-400'}`} disabled={selectedAnswer.length > 0} value={currentQuestion.answers[1]}>{currentQuestion.answers[1]}</button>
            </div>
    
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-4">
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer.answer === currentQuestion.answers[2] ? 'disabled:bg-secondary' : 'disabled:bg-gray-400'}`} disabled={selectedAnswer.length > 0} value={currentQuestion.answers[2]}>{currentQuestion.answers[2]}</button>
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer.answer === currentQuestion.answers[3] ? 'disabled:bg-secondary' : 'disabled:bg-gray-400'}`} disabled={selectedAnswer.length > 0} value={currentQuestion.answers[3]}>{currentQuestion.answers[3]}</button>
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
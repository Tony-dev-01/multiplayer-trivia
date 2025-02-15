import { useEffect, useState } from "react";
import { socket } from "../../config/socket";
import { useParams, useSearchParams } from "react-router-dom";

const Game = () => {
    const [searchParams] = useSearchParams();
    const categories = searchParams.get('categories');
    const difficulties = searchParams.get('difficulties');
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [selectedAnswer, setSelectedAnswer] = useState('');

    const gameHasStarted = Object.values(currentQuestion).length > 0;


    useEffect(() => {
        socket.on('receive-question', (question) => {
            setCurrentQuestion(() => question);
            setSelectedAnswer(() => '');
            console.log(question);
        });

        return () => {
            socket.off('receive-question');
        }
    }, [socket]);

    const handleAnswer = (e) => {
        e.preventDefault();
        console.log(e.target.value);
        setSelectedAnswer(() => e.target.value);
        dispatchEvent(new Event('submit'));
    }

    return(
        <div className="w-[80vw] h-[100vh] m-auto py-16 flex flex-col justify-center items-center">
            {gameHasStarted ? 
            <form className="flex flex-col gap-4 w-full h-full" onClick={handleAnswer}>
            <h2 className="text-2xl font-bold">{currentQuestion.question.text}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-4">
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer === currentQuestion.answers[0] ? 'disabled:bg-secondary' : 'disabled:bg-gray-300'}`} disabled={selectedAnswer.length > 0} value={currentQuestion.answers[0]}>{currentQuestion.answers[0]}</button>
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer === currentQuestion.answers[1] ? 'disabled:bg-secondary' : 'disabled:bg-gray-300'}`} disabled={selectedAnswer.length > 0} value={currentQuestion.answers[1]}>{currentQuestion.answers[1]}</button>
            </div>
    
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-4">
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer === currentQuestion.answers[2] ? 'disabled:bg-secondary' : 'disabled:bg-gray-300'}`} disabled={selectedAnswer.length > 0} value={currentQuestion.answers[2]}>{currentQuestion.answers[2]}</button>
                <button type="button" className={`h-32 rounded-lg bg-secondary text-black flex justify-center items-center hover:bg-primary ${selectedAnswer === currentQuestion.answers[3] ? 'disabled:bg-secondary' : 'disabled:bg-gray-300'}`} disabled={selectedAnswer.length > 0} value={currentQuestion.answers[3]}>{currentQuestion.answers[3]}</button>
            </div>
    
            </form>
            : 
            <p>Waiting for game to start...</p>
            }
        </div>
    )
}; 

export default Game;
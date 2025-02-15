
const shuffleAnswers = (array) => {
    // Iterate over the array in reverse order
    for (let i = array.length - 1; i > 0; i--) {

        // Generate Random Index
        const j = Math.floor(Math.random() * (i + 1));

        // Swap elements
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

module.exports = (io) => {

    const startGame = async function (gameRoomId, username, categories, difficulties, numQuestions) {
        const sockets = await io.in(gameRoomId).fetchSockets();
        let questionsRemaining = numQuestions - 1;

        console.log(numQuestions);
    
        const gameURL = `game?categories=${categories}&&difficulties=${difficulties}`
        io.sockets.to(gameRoomId).emit('starting-game', gameURL);

        // fetch question from api here and store it in question variable
        const request = await fetch(`https://the-trivia-api.com/v2/questions?categories=${categories}&&difficulties=${difficulties}`);
        const questions = await request.json();
        console.log(questions);


        // fetch question every 30 seconds
        const questionFetchInterval = setInterval(() => {
            if (questionsRemaining >= 0){
                const currentQuestion = questions[questionsRemaining];
                const answers = shuffleAnswers([currentQuestion.correctAnswer, ...currentQuestion.incorrectAnswers])
                const refactoredQuestionObject = {
                    id: currentQuestion.id,
                    answers,
                    question: currentQuestion.question
                };
                io.sockets.to(gameRoomId).emit('receive-question', refactoredQuestionObject);
                questionsRemaining--;
            } else {
                // game finished
                clearInterval(questionFetchInterval);
            }
        }, 5000);



        // broadcast questions to the room
    };
    
    return{
        startGame
    }
}
const {rooms} = require('../config/game.config.js');

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

const networkBuffer = 1000; // 1 second buffer for events

const calculateUserScore = (userAnswer) => {
  const {gameRoomId, username, answer} = userAnswer;
  const currentQuestion = rooms[gameRoomId].questions[rooms[gameRoomId].questionsRemaining];

  if (!rooms[gameRoomId].users[username]){
    // initialize user if they don't exist
    rooms[gameRoomId].users[username] = {score: 0, numWrongAnswer: 0, numCorrectAnswer: 0};
  };

  const userCurrentScore = rooms[gameRoomId].users[username].score;

  const correctAnswer = currentQuestion.correctAnswer;

  if (answer === undefined){
    // if user has not given any answer or not responded in time
    rooms[gameRoomId].users[username].score = userCurrentScore + 0;
    return {userScore: userCurrentScore, correctAnswer, isUserCorrect: false};
  } else {
    // console.log(rooms[gameRoomId]);
    if(currentQuestion.correctAnswer !== answer.answer){
      // user got wrong answer
      console.log('wrong answer');
      rooms[gameRoomId].users[username].score = userCurrentScore + 0;
      return {userScore: userCurrentScore, correctAnswer, isUserCorrect: false};
    } else {
      // user got correct answer
      console.log('correct answer')
      const numPoints = Math.round(answer.timeRemaining * 10);
      const userNewScore = userCurrentScore + numPoints;
      rooms[gameRoomId].users[username].score = userNewScore;
      return {userScore: userNewScore, correctAnswer, isUserCorrect: true};
    }
  }
}



module.exports = (io) => {

    const broadcastQuestion = (gameRoomId) => {
        let questionsRemaining = rooms[gameRoomId].questionsRemaining;
        questionsRemaining = questionsRemaining - 1;
        const currentQuestion = rooms[gameRoomId].questions[questionsRemaining];
        console.log(currentQuestion);
        const answers = shuffleAnswers([currentQuestion.correctAnswer, ...currentQuestion.incorrectAnswers])
        const refactoredQuestionObject = {
            id: currentQuestion.id,
            answers,
            question: currentQuestion.question
        };
        rooms[gameRoomId].questionsRemaining = questionsRemaining;
        io.sockets.to(gameRoomId).emit('new-question', refactoredQuestionObject);

        const displayScoreToRoom = setInterval(() => {
          clearInterval(displayScoreToRoom);
          const scores = Object.entries(rooms[gameRoomId].users).map(([username, value]) => {
            return {
              username,
              ...value
            };
          });
          
          if (rooms[gameRoomId].questionsRemaining === 0){
            // game is over
            io.sockets.to(gameRoomId).emit('game-over', scores, rooms[gameRoomId].questionsRemaining);
            console.log('game over!');
          } else {
            io.sockets.to(gameRoomId).emit('scoreboard', scores, rooms[gameRoomId].questionsRemaining);
            const displayQuestionToRoom = setInterval(() => {
              broadcastQuestion(gameRoomId);
              // console.log(rooms[gameRoomId]);
              clearInterval(displayQuestionToRoom);
            }, 7000)
          }
          
        }, 15000);
    
    };

    const startGame = async function (gameRoomId, username, categories, difficulties, numQuestions) {
        const sockets = await io.in(gameRoomId).fetchSockets();
        const gameURL = `game?categories=${categories}&&difficulties=${difficulties}`
        const countdown = 5000;
        io.sockets.to(gameRoomId).emit('start-countdown', countdown, gameURL);

        // io.sockets.to(gameRoomId).emit('starting-game', gameURL);

        // fetch question from api here and store it in question variable
        // let request;
        // let questions;

        // const fetchQuestions = async () => {
        //   // returns 10 questions per call
        //   request = await fetch(`https://the-trivia-api.com/v2/questions?categories=${categories}&&difficulties=${difficulties}`);
        //   questions = await request.json();
        // };

        // if (numQuestions === 15){
        
        // } else if (numQuestions === 20){

        // } else {
        
        // }

        // const request = await fetch(`https://the-trivia-api.com/v2/questions?categories=${categories}&&difficulties=${difficulties}`);
        // const questions = await request.json();
      
        const questions = [
            {
                category: 'music',
                id: '625063d7e12f6dec240bdf86',
                correctAnswer: 'Nothing Compares 2 U',
                incorrectAnswers: [ 'Whoomp! (There It Is)', 'Whip It', 'Bust a Move' ],
                question: { text: "What song did Sinead O'Connor have a hit with in 1990?" },
                tags: [ 'songs', 'one_hit_wonders', 'music' ],
                type: 'text_choice',
                difficulty: 'easy',
                regions: [],
                isNiche: false
              },
              {
                category: 'music',
                id: '622a1c397cc59eab6f950d45',
                correctAnswer: 'Black Eyed Peas',
                incorrectAnswers: [ 'MercyMe', 'Three 6 Mafia', 'The Velvet Underground' ],
                question: { text: "Which band includes 'will.i.am'?" },
                tags: [ 'music' ],
                type: 'text_choice',
                difficulty: 'easy',
                regions: [],
                isNiche: false
              },
              {
                category: 'music',
                id: '622a1c357cc59eab6f94fef9',
                correctAnswer: 'Kylie Minogue',
                incorrectAnswers: [ 'Madonna', 'Mika', 'Hikaru Utada' ],
                question: { text: "Which singer released the song 'I Should Be So Lucky'?" },
                tags: [ 'songs', 'musicians', 'music' ],
                type: 'text_choice',
                difficulty: 'easy',
                regions: [],
                isNiche: false
              },
              {
                category: 'music',
                id: '622a1c397cc59eab6f950d10',
                correctAnswer: 'The Beatles',
                incorrectAnswers: [ 'Deep Purple', 'Feeder', 'Uriah Heep' ],
                question: { text: "Which English rock band released the song 'Love Me Do'?" },
                tags: [ 'songs', 'general_knowledge', 'music' ],
                type: 'text_choice',
                difficulty: 'easy',
                regions: [],
                isNiche: false
              },
              {
                category: 'music',
                id: '622a1c397cc59eab6f950cef',
                correctAnswer: 'Queen',
                incorrectAnswers: [ 'Level 42', 'Deep Purple', 'Feeder' ],
                question: {
                  text: "Which British rock band released the song 'Bohemian Rhapsody'?"
                },
                tags: [ 'rock_music', 'music' ],
                type: 'text_choice',
                difficulty: 'easy',
                regions: [],
                isNiche: false
              },
              {
                category: 'music',
                id: '622a1c397cc59eab6f950d11',
                correctAnswer: 'The Beatles',
                incorrectAnswers: [ 'The Who', 'The Clash', 'Pink Floyd' ],
                question: {
                  text: "Which English rock band released the song 'Here Comes the Sun'?"
                },
                tags: [ 'rock_music', 'music' ],
                type: 'text_choice',
                difficulty: 'easy',
                regions: [],
                isNiche: false
              },
              {
                category: 'music',
                id: '622a1c387cc59eab6f950b86',
                correctAnswer: 'Eagles',
                incorrectAnswers: [ 'The Pussycat Dolls', 'Three 6 Mafia', 'The Velvet Underground' ],
                question: {
                  text: "Which American country rock band released the song 'Hotel California'?"
                },
                tags: [ 'music' ],
                type: 'text_choice',
                difficulty: 'easy',
                regions: [],
                isNiche: false
              },
              {
                category: 'music',
                id: '622a1c347cc59eab6f94fba7',
                correctAnswer: '"I Will Survive" by Gloria Gaynor',
                incorrectAnswers: [
                  '"All Star" by Smash Mouth',
                  '"Man! I Feel Like a Woman!" by Shania Twain',
                  `"You're So Vain" by Carly Simon`
                ],
                question: {
                  text: 'Which song begins with the lyrics: "At first I was afraid, I was petrified / Kept thinking I could never live without you by my side..."?'
                },
                tags: [ 'songs', 'lyrics', 'general_knowledge', 'music' ],
                type: 'text_choice',
                difficulty: 'easy',
                regions: [],
                isNiche: false
              },
              {
                category: 'music',
                id: '622a1c397cc59eab6f950d1e',
                correctAnswer: 'The Beatles',
                incorrectAnswers: [ 'Deep Purple', 'Feeder', 'Uriah Heep' ],
                question: {
                  text: "Which English rock band released the song 'Sgt. Pepper's Lonely Hearts Club Band'?"
                },
                tags: [ 'music' ],
                type: 'text_choice',
                difficulty: 'easy',
                regions: [],
                isNiche: false
              },
              {
                category: 'music',
                id: '622a1c357cc59eab6f94ff1c',
                correctAnswer: 'Madonna',
                incorrectAnswers: [ 'Eric Clapton', 'Nicki Minaj', 'Alanis Morissette' ],
                question: { text: "Which American musician sung 'Like a Prayer'?" },
                tags: [ 'general_knowledge', 'music' ],
                type: 'text_choice',
                difficulty: 'easy',
                regions: [],
                isNiche: false
              }
        ]

        // Store questions in DB?


        // Store questions in RAM
        if (!rooms[gameRoomId]) {
            rooms[gameRoomId] = {id: gameRoomId, questions, questionsRemaining: 10, users: {}};
            console.log('room created ' + rooms[gameRoomId].id)
            console.log(rooms[gameRoomId])
        } else {
            rooms[gameRoomId] = {id: gameRoomId, questions, questionsRemaining: 10, users: {}};
            console.log(rooms)
        }
            
        const initalDelay = setTimeout(() => {
           // broadcast questions to the room
          broadcastQuestion(gameRoomId);
          clearTimeout(initalDelay);
        }, 6000)
    };

    const getUserAnswer = async function (answer, callback) {
      const {correctAnswer, isUserCorrect, userScore} = calculateUserScore(answer);
      console.log(userScore);

      callback({
        userScore,
        userAnswer: answer.answer,
        correctAnswer,
        isUserCorrect
      })
    };

    const getQuestionResults = async function () {

    };

    
    return{
        startGame,
        getUserAnswer,
        getQuestionResults
    }
};
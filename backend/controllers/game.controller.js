const { MongoClient } = require('mongodb');
const ShortUniqueId = require('short-unique-id');
const {rooms} = require('../config/game.config');

const {database} = require('../config/app.config');

const shortUUID = new ShortUniqueId({dictionary: 'number', length: 10}).dict.join('');


const validateAnswer = (userAnswer) => {
    // Check if answer is correct and calculate points
    // return the score
    const newScore = userAnswer.currentScore + 15;
    return 15;
}

const updateScore = async (req, res) => {  
    const client = new MongoClient(database.MONGO_URI, database.options);

    const gameRoomId = Number(req.params.gameRoomId);
    const username = req.body.username;
    const answer = req.body.answer;

    try {
        client.connect();

        const db = client.db("trivia-multiplayer");

        const newScore = validateAnswer(answer);

        const results = await db.collection('rooms').updateOne({_id: gameRoomId}, {'$set': {[`users.${username}.score`]: newScore}});

        if (results.acknowledged){
            res.status(204).json({status: 204});
        };

    } catch(err){
        res.status(404).json({status: 404, data: {}, message: err.message})
    }
};

const createRoom = async (req, res) => {
    const client = new MongoClient(database.MONGO_URI, database.options);

    const gameRoomId = Number(shortUUID);

    try {
        client.connect();

        const db = client.db("trivia-multiplayer");

        // create the room
        const newRoom = await db.collection('rooms').insertOne({
            _id: gameRoomId,
            "users": {
                
            }
        });

        if (newRoom.acknowledged){
            console.log('new room created on db')
            rooms[gameRoomId] = {"_id": gameRoomId, questions: []};
            console.log(rooms);
            res.status(201).json({status: 201, message: 'Successful', data: {gameRoomId}});
        };

    } catch(err){
        res.status(404).json({status: 404, data: {}, message: err.message})
    }
}

const addNewUser = async(req, res) => {
    const client = new MongoClient(database.MONGO_URI, database.options);

    const gameRoomId = Number(req.params.gameRoomId);
    const username = req.body.username.length > 0 ? req.body.username : undefined;

    const user = { username, "score": 0, "numWrongAnswers": 0, "numCorrectAnswers": 0}

    try {
        client.connect();

        const db = client.db("trivia-multiplayer");

        if (username){
            const createNewUser = await db.collection('rooms').updateOne({_id: gameRoomId}, {'$set': {[`users.${username}`]: user}});
            console.log('new user created on db')

            if (createNewUser.acknowledged){

                console.log('new user', username);
                res.status(201).json({status: 201, message: 'Successful'});
            };
        } else {
            throw new Error('Invalid username.')
        }
    } catch(err){
        res.status(404).json({status: 404, data: {}, message: err.message})
    }
};

const verifyRoomExists = async (req, res) => {
    const client = new MongoClient(database.MONGO_URI, database.options);

    const gameRoomId = Number(req.params.gameRoomId);

    try {
        client.connect();

        const db = client.db("trivia-multiplayer");

        // check if room exists
        const room = await db.collection('rooms').findOne({_id: gameRoomId});

        if (room === null){
            throw new Error('Please enter a valid game code.')
        } else {
            res.status(200).json({status: 200, message: 'Successful'});
        }

    } catch (err){
        res.status(404).json({status: 404, data: {}, message: err.message});
    }
}

module.exports = {
    updateScore,
    createRoom,
    addNewUser,
    verifyRoomExists
}
const { MongoClient } = require('mongodb');

const {database} = require('../config/app.config');

const postScore = async (req, res) => {  
    const client = new MongoClient(database.MONGO_URI, database.options);
    try {
        client.connect();

        const db = client.db("trivia-multiplayer");

        const results = await db.collection('scores').insertOne({key: 'test'});

        if (results.acknowledged){
            res.status(201).json({status: 201, message: 'Successful'});
        };
    } catch(err){
        res.status(404).json({status: 404, data: {}, message: err.message})
    }
};

module.exports = {
    postScore
}
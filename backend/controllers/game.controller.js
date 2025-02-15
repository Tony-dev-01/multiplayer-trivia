
const fetchQuestion = async (req, res) => {   
    console.log(req);
    try {
        const request = await fetch(`https://the-trivia-api.com/v2/questions?categories=${req.categories}&&difficulties=${req.difficulties}`);
        const data = await request.json();
        return {status: 200, data: data};
    } catch(err){
        return {status: 401, message: err.message};
    }

};

module.exports = {
    fetchQuestion
}
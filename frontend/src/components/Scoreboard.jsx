

const Scoreboard = ({usersScores}) => {

    const sortListToDescendingOrder = (users) => {
        // sorting the list to have the highest scores at the top
        return users.sort((a, b) => (a.score > b.score ? 1 : a.score < b.score ? -1 : 0)).reverse();
    };

    return (
        <div>
            <p>This is the scoreboard.</p>
            <p>questions remaining: {usersScores.questionsRemaining}</p>
            <ul>
                {sortListToDescendingOrder(usersScores.scores).map((user) => {
                    return <li>
                        {user.username} - {user.score}
                        </li>
                })}
            </ul>
        </div>
    )
};

export default Scoreboard;
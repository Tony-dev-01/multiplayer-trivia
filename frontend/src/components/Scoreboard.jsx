

const Scoreboard = ({usersScore}) => {
    console.log(usersScore);

    const sortListToDescendingOrder = () => {
        // sorting the list to have the highest scores at the top

    };
    
    return (
        <div>
            <p>This is the scoreboard.</p>
            <ul>
                {usersScore.map((user) => {
                    return <li>
                        {user.username} - {user.score}
                        </li>
                })}
            </ul>
        </div>
    )
};

export default Scoreboard;
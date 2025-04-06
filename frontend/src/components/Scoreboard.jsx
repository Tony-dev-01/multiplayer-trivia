

const Scoreboard = ({usersScores}) => {

    const sortListToDescendingOrder = (users) => {
        // sorting the list to have the highest scores at the top
        console.log(users)
        return users.sort((a, b) => (a.score > b.score ? 1 : a.score < b.score ? -1 : 0)).reverse();
    };

    return (
        <div className="flex flex-col gap-4 w-[70%] max-w-[500px] h-full">
            <p>{usersScores.questionsRemaining} questions remaining</p>
            <ul className="w-full flex flex-col gap-4">
                {sortListToDescendingOrder(usersScores.scores).map((user, index) => {
                    return <li className={`flex flex-row gap-4 px-4 py-4 justify-between w-full rounded-md text-neutral ${index === 0 ? 'bg-primary' : 'bg-base-300 text-neutral-content'}`}>
                        {index + 1}{index === 0 ? "st" : index === 1 ? "nd" : index === 3 ? "rd" : "th"} <span className="">{user.username}</span> <span>{user.score} points</span>
                        </li>
                })}
            </ul>
        </div>
    )
};

export default Scoreboard;
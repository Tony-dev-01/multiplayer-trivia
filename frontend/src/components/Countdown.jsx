import { useState, useEffect } from "react";


const Countdown = ({counterLength, onTimeout, selectedAnswer, setTimeRemaining}) => {
    const [counter, setCounter] = useState(counterLength);
    const [timeOut, setTimeOut] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            if (timeOut){
                clearInterval(timer);
                onTimeout()
            } else if (selectedAnswer !== ''){
                setTimeRemaining(counter);
                clearTimeout();
            } else {
                setCounter(timeRemaining => timeRemaining - 1)
            }
        }, 1000);

        return () => {
            clearInterval(timer);
        }
    }, [])

    return(
        <span className="countdown font-mono text-6xl">
            <span style={{"--value": counter}}></span>
        </span>
    )
}; 

export default Countdown;
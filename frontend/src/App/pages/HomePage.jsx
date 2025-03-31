import { useEffect } from "react";
import Hero from "../../components/Hero"
import { socket } from "../../config/socket";

const HomePage = () => {
    useEffect(() => {
        socket.auth = { username: 'new_user' };
        socket.connect();

        socket.on("connect", () => {
            console.log('we are connected')
        });

        return () => {
            socket.off('connect');
            socket.disconnect(undefined, undefined);
        }
    }, []);

    return(
        <Hero />
    )
};

export default HomePage;
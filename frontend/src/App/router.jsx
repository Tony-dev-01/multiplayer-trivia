import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Homepage";
import GameLobby from "./pages/GameLobby";

const router = createBrowserRouter([
    { path: '/', element: <HomePage />},
    { path: '/:gameRoomId', element: <GameLobby />}
]);

export default router;
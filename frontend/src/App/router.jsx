import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Homepage";
import GameLobby from "./pages/GameLobby";
import Game from "./pages/Game";

const router = createBrowserRouter([
    { path: '/', element: <HomePage />},
    { path: '/:gameRoomId', element: <GameLobby />},
    { path: '/:gameRoomId/game', element: <Game />},
]);

export default router;
import { createContext, useReducer, useState } from "react";
import { socket } from "../config/socket";

export const GameContext = createContext();

const initialState = {

};

const reducer = (state, action) => {

};

export const GameContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [gameRoomId, setGameRoomId] = useState(() => {

    })
}
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { useEffect } from "react";
import { socket } from "../config/socket";


export default function App() {

  return (
    <div className="h-full w-[90%] py-10 flex justify-center flex-col">
      <div id="toast" className="absolute top-3/4 left-3/4"></div>
      <RouterProvider router={router} />
    </div>
  )
}

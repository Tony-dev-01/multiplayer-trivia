
import JoinModal from "./JoinModal";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleCreateGame = () => {
    // send get request to server
    fetch('http://localhost:4000/create-room', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then ((response) => response.json())
    .then((data) => {
      navigate(`/${data.data.gameRoomId}`); // navigate user to their new room
    })
  };

    return(
      <>
      <JoinModal />
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)",
      }}>
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">Setup a trivia game in one click</h1>
          <p className="mb-5">
            Perfect for a fun night with your friends and family.
          </p>
          <div className="flex flex-row gap-4 justify-center">
          <button className="btn btn-secondary" onClick={()=> {
            document.getElementById('my_modal_1').showModal();
            }}>Join a game</button>
          <button className="btn btn-primary" onClick={handleCreateGame}>Create a game</button>
          </div>
        </div>
      </div>
    </div>
    </>
    )
}

export default Hero;
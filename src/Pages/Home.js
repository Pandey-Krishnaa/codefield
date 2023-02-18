import React, { useState } from "react";
import { v4 } from "uuid";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setusername] = useState("");
  const createNewRoom = (e) => {
    e.preventDefault();
    setRoomId(v4());
    toast.success("new room created");
  };
  const joinRoom = (e) => {
    e.preventDefault();
    if (!roomId) {
      toast.error("room id is required");
      return;
    }
    if (!username) {
      toast.error("username is required");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };
  const handleEnterOnInputs = (e) => {
    e.preventDefault();
    if (e.code === "Enter") joinRoom(e);
  };
  return (
    <div className="home">
      <div className="form">
        <h1 className="logo">
          <i class="fa-sharp fa-solid fa-code"></i>
          Code<span style={{ color: "orange" }}>Field</span>
        </h1>
        <form>
          <div className="input-group">
            <input
              type="text"
              placeholder="Paste Room Id"
              value={roomId}
              onChange={(e) => {
                e.preventDefault();
                setRoomId(e.target.value);
              }}
              onKeyUp={(e) => {
                handleEnterOnInputs(e);
              }}
            />
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => {
                e.preventDefault();
                setusername(e.target.value);
              }}
              onKeyUp={(e) => {
                handleEnterOnInputs(e);
              }}
            />
          </div>
          <button
            onClick={(e) => {
              joinRoom(e);
            }}
          >
            Join Room
          </button>
          <p>
            if you don't have invite,create a room &nbsp;
            <a href="" className="genrateId" onClick={createNewRoom}>
              new room
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Home;

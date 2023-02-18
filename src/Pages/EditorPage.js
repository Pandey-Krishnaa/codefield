import React, { useEffect, useState } from "react";
import Avatar from "react-avatar";
import Editor from "../component/Editor";
import { useRef } from "react";
import { initSocket } from "../socket";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
function Client({ username }) {
  return (
    <div
      className="client"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Avatar name={username} size={50} round="14px" />

      <span style={{ marginTop: "7px" }}>{username}</span>
    </div>
  );
}

function EditorPage() {
  const reactnavigate = useNavigate();
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const [client, setClient] = useState([]);
  const { roomID } = useParams();
  const handleErrors = (err) => {
    console.log("socket error", err);
    toast.err("something went wrong");
    reactnavigate("/");
  };
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => {
        handleErrors(err);
      });
      socketRef.current.on("connect_failed", (err) => {
        handleErrors(err);
      });
      socketRef.current.emit("join", {
        username: location.state?.username,
        roomID,
      });

      socketRef.current.on("joined", ({ clients, username, socketid }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room`);
          console.log(`${username} joined`);
        }
        setClient(clients);
        socketRef.current.emit("sync-code", {
          code: codeRef.current,
          socketid,
        });
      });

      socketRef.current.on("disconnected", ({ socketid, username }) => {
        toast.success(`${username} left the room`);
        setClient((prev) => {
          return prev.filter((p) => p.socketid !== socketid);
        });
      });
    };
    init();
    return () => {
      socketRef.current.off("joined");
      socketRef.current.off("disconnected");
      socketRef.current.disconnect();
    };
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }
  async function copyToClipboard(e) {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(roomID);
      toast.success("Room id Copied");
    } catch (err) {
      console.log(err);
      toast.error("could not copy the room id");
    }
  }
  function leaveRoom() {
    reactnavigate("/");
  }

  return (
    <div className="editorpage">
      <div className="left">
        <div className="left_inner">
          <h1 className="logo" style={{ padding: "10px" }}>
            <i class="fa-sharp fa-solid fa-code"></i>
            Code<span style={{ color: "orange" }}>Field</span>
          </h1>
        </div>
        <div className="clients">
          <h3 style={{ marginBottom: "10px" }}>Connected</h3>
          <div
            className="connected_clients"
            style={{ display: "flex", gap: 20, flexWrap: "wrap" }}
          >
            {client.map((c) => (
              <Client key={c.socketId} username={c.username} />
            ))}
          </div>
        </div>
        <div
          className="buttons"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <button
            onClick={(e) => {
              copyToClipboard(e);
            }}
          >
            Copy Room ID
          </button>
          <button onClick={leaveRoom}>Leave</button>
        </div>
      </div>
      <div className="right">
        <Editor
          socketRef={socketRef}
          roomID={roomID}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
}

export default EditorPage;

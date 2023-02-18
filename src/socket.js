import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    reconnectionAttempt: "Infinity",
    timeout: 10000,
    transports: ["websocketS"],
  };

  return io(process.env.REACT_APP_BACKEND_URL);
};

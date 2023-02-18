const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
app.use(cors());
app.use(express.static("build"));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "POST");

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

const userSocketMap = {};

// getting all the clients who are present in the specific room
// basically roomid is room name
const getJoinedClients = (roomID) => {
  // io.sockets.adapter.rooms.get(roomID) -> this line is used for getting all the clients socket id with in a room, it returns a map ds

  return Array.from(io.sockets.adapter.rooms.get(roomID) || []).map(
    (socketid) => {
      return {
        socketid,
        username: userSocketMap[socketid],
      };
    }
  );
};

//listening for connection
io.on("connection", (socket) => {
  // listening on join event and the data is passed by the client
  socket.on("join", (data) => {
    // mapping socketid with username
    userSocketMap[socket.id] = data.username;

    //joining the connected socket to the room -> room id is passed from the client
    socket.join(data.roomID);
    const clients = getJoinedClients(data.roomID);
    clients.forEach(({ socketid }) => {
      // to is basically used for notify a particular socket, here we are notifing all the connencted socket by emitting joined event, and we can listen on the client side
      io.to(socketid).emit("joined", {
        clients,
        username: data.username,
        socketid: socket.id,
      });
    });
  });
  // emitting event to all the room members expecting the current user
  socket.on("code-change", (data) => {
    socket.in(data.roomID).emit("code-change", data);
  });

  socket.on("sync-code", ({ socketid, code }) => {
    io.to(socketid).emit("code-change", { code });
  });

  // "disconnectiong" event is triggered when socket closes the tab on the client side
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomid) => {
      // "in" method is used for emitting an event with in a room it takes room id or name, here we are emitting disconnected event
      socket.in(roomid).emit("disconnected", {
        socketid: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    // socket.leave() is used leave the room
    socket.leave();
  });
});

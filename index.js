const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
});

// CORS setup
let whiteListedUrls = ["http://localhost:4200/"];

let corsOptions = {
  origin: function (origin, callback) {
    if (whiteListedUrls.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

/* MIDDLEWARE **/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("pages"));

// all origins
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/pages/home.html");
});

app.get("/room/:roomId", (req, res) => {
  res.sendFile(__dirname + "/pages/room.html");
});

app.post("/api/new-message", (req, res) => {
  const payload = req.body;
  const messageId = uuidv4();
  const messageObj = {
    messageId,
    ...payload,
  };
  io.to(messageObj.roomId).emit("new-message", messageObj);
  res.send({
    status: "successful",
    data: messageObj,
  });
});

// listening to events from client
io.on("connection", (socket) => {
  socket.on("join-room", (payload) => {

    console.log('New room created', payload.roomId)
    socket.join(payload.roomId);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port ::: ", process.env.PORT || 3000);
});

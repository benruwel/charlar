const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const app = express();
const http = require("http");
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

var corsOptions = {
  origin: function (origin, callback) {
    if (whiteListedUrls.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const emitNewMessageEvent = (msg) => {
  const timestamp = new Date().getTime();
  const messageId = uuidv4();
  const messageObj = {
    timestamp: timestamp.toString(),
    messageId: messageId,
    message: msg,
  };
  console.log(messageObj);
  io.emit("new-message", messageObj);
  return messageObj;
};

/* MIDDLEWARE **/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// all origins
app.use(cors());

// app.use(helmet());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/pages/index.html");
});

app.get("/api/hello", (req, res) => {
  res.send({
    message: "Yep api works",
  });
});

app.post("/api/new-message", (req, res) => {
  const message = req.body?.message;
  const messageEmitted = emitNewMessageEvent(message);
  res.send({
    status: "successful",
    data: messageEmitted,
  });
});

// listening to events from client
io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("new-message", (msg) => {
    // sends this message event to everyone including the sender
    io.emit("new-message", msg);
    console.log(msg);
  });
});

// emit events from server to everyone
// io.emit("some event", {
//   someProp: "some value",
//   otherProp: "other value",
// });

// emit event for everyone except the sender
// io.on("connection", (socket) => {
//   socket.broadcast.emit('hi')
// });

server.listen(3000, () => {
  console.log("Listening on port 3000");
});

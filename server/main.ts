import express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import path from "path";
import { connectToDatabase } from "./chat/chat-db";
import { messageRouter } from "./chat/routes";
import chatHandlers from "./chat/handlers";
import cors from "cors";

connectToDatabase("mongodb://localhost:27017")
  .then(() => {
    const app = express();

    const server = http.createServer(app);
    const io = new socketio.Server(server, {
      cors: {
        origin: ["http://localhost:4200"],
      },
    });
    io.on('connection', (socket) => chatHandlers(socket))

    const port = process.env.PORT || 3000;
    app.use(cors());
    app.use(express.static(path.join(__dirname, "public")));
    app.use("/api/messages", messageRouter);

    server.listen(port, () => {
      console.log("Server listening at port %d", port);
    });

  })
  .catch((error) => console.error(error));

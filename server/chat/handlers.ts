import { Socket } from "socket.io";
import { ChatClientEvents, ChatServerEvents } from "../events";
import { collections } from "./chat-db";

let numUsers = 0;

export default function (socket: Socket) {
  let addedUser = false;
  let socketUsername = "";

  socket.on(ChatClientEvents.NewMesage, (data) => {
    const message = {
      userName: socketUsername,
      text: data,
    };
    collections.messages?.insertOne(message);

    socket.broadcast.emit(ChatClientEvents.NewMesage, message);
  });

  socket.on(ChatClientEvents.AddUser, (username) => {
    if (addedUser) return;

    socketUsername = username;
    ++numUsers;
    addedUser = true;
    socket.emit(ChatServerEvents.Login, {
      numUsers: numUsers,
    });
  });

  socket.on(ChatClientEvents.Disconnect, () => {
    if (addedUser) {
      --numUsers;
    }
  });
};

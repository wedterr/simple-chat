import * as mongodb from "mongodb";

export interface ChatMessage {
  _id?: mongodb.ObjectId;
  userName: string;
  text: string;
}

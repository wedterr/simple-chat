import * as mongodb from "mongodb";
import { ChatMessage } from "./chat-message.interface";

export const collections: {
    messages?: mongodb.Collection<ChatMessage>;
} = {};

export async function connectToDatabase(uri: string) {
    const client = new mongodb.MongoClient(uri);
    await client.connect();

    const db = client.db("simpleChat");
    await applySchemaValidation(db);

    const messagesCollection = db.collection<ChatMessage>("messages");
    collections.messages = messagesCollection;
}

async function applySchemaValidation(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["userName", "text"],
            additionalProperties: false,
            properties: {
                _id: {},
                userName: {
                    bsonType: "string",
                    description: "'userName' is required and is a string",
                    minLength: 1
                },
                text: {
                    bsonType: "string",
                    description: "'text' is required and is a string",
                },
            },
        },
    };

   await db.command({
        collMod: "messages",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("messages", {validator: jsonSchema});
        }
    });
}
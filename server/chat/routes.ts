import * as express from "express";
import { collections } from "./chat-db";

export const messageRouter = express.Router();
messageRouter.use(express.json());

messageRouter.get("/", async (_req, res) => {
  let { limit, skip } = _req.query;

  try {
    let limitNum = parseInt(limit as string, 10) || 20;
    let skipCount = parseInt(skip as string, 10) || 0;

    const messages = await collections.messages
      ?.aggregate([
        {
          $facet: {
            metadata: [{ $count: "totalCount" }],
            data: [
              { $sort: { _id: -1 }},
              { $skip: skipCount },
              { $limit: limitNum },
            ],
          },
        },
      ])
      .toArray();

    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

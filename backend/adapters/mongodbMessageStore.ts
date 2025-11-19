import { Collection } from "mongodb";
import type { Message } from "chatly-sdk";
import type { MessageStoreAdapter } from "chatly-sdk";

export class MongoDBMessageStore implements MessageStoreAdapter {
  private collection: Collection<Message>;

  constructor(collection: Collection<Message>) {
    this.collection = collection;
  }

  async create(message: Message): Promise<Message> {
    await this.collection.insertOne(message);
    return message;
  }

  async listByUser(userId: string): Promise<Message[]> {
    return await this.collection
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .sort({ timestamp: 1 })
      .toArray();
  }

  async listByGroup(groupId: string): Promise<Message[]> {
    return await this.collection
      .find({ groupId })
      .sort({ timestamp: 1 })
      .toArray();
  }
}


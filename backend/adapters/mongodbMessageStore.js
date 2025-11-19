import { Collection } from "mongodb";

export class MongoDBMessageStore {
  constructor(collection) {
    this.collection = collection;
  }

  async create(message) {
    await this.collection.insertOne(message);
    return message;
  }

  async listByUser(userId) {
    return await this.collection
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .sort({ timestamp: 1 })
      .toArray();
  }

  async listByGroup(groupId) {
    return await this.collection
      .find({ groupId })
      .sort({ timestamp: 1 })
      .toArray();
  }
}


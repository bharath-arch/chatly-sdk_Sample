import { Collection } from "mongodb";

export class MongoDBUserStore {
  constructor(collection) {
    this.collection = collection;
  }

  async create(user) {
    const storedUser = {
      ...user,
      createdAt: Date.now(),
    };
    await this.collection.insertOne(storedUser);
    return storedUser;
  }

  async findById(id) {
    const user = await this.collection.findOne({ id });
    return user || undefined;
  }

  async save(user) {
    await this.collection.updateOne(
      { id: user.id },
      { $set: user },
      { upsert: true }
    );
  }

  async list() {
    return await this.collection.find({}).toArray();
  }
}


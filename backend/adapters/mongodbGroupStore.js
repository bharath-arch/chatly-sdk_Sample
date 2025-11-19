import { Collection } from "mongodb";

export class MongoDBGroupStore {
  constructor(collection) {
    this.collection = collection;
  }

  async create(group) {
    await this.collection.insertOne(group);
    return group;
  }

  async findById(id) {
    const group = await this.collection.findOne({ id });
    return group || undefined;
  }

  async list() {
    return await this.collection.find({}).toArray();
  }
}


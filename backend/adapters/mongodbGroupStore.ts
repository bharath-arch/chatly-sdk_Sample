import { Collection } from "mongodb";
import type { Group } from "chatly-sdk";
import type { GroupStoreAdapter } from "chatly-sdk";

export class MongoDBGroupStore implements GroupStoreAdapter {
  private collection: Collection<Group>;

  constructor(collection: Collection<Group>) {
    this.collection = collection;
  }

  async create(group: Group): Promise<Group> {
    await this.collection.insertOne(group);
    return group;
  }

  async findById(id: string): Promise<Group | undefined> {
    const group = await this.collection.findOne({ id });
    return group || undefined;
  }

  async list(): Promise<Group[]> {
    return await this.collection.find({}).toArray();
  }
}


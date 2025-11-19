import { Collection } from "mongodb";
import type { User, StoredUser } from "chatly-sdk";
import type { UserStoreAdapter } from "chatly-sdk";

export class MongoDBUserStore implements UserStoreAdapter {
  private collection: Collection<StoredUser>;

  constructor(collection: Collection<StoredUser>) {
    this.collection = collection;
  }

  async create(user: User): Promise<User> {
    const storedUser: StoredUser = {
      ...user,
      createdAt: Date.now(),
    };
    await this.collection.insertOne(storedUser);
    return storedUser;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.collection.findOne({ id });
    return user || undefined;
  }

  async save(user: StoredUser): Promise<void> {
    await this.collection.updateOne(
      { id: user.id },
      { $set: user },
      { upsert: true }
    );
  }

  async list(): Promise<User[]> {
    return await this.collection.find({}).toArray();
  }
}


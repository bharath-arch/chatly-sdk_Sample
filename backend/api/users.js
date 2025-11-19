import express from "express";
import { ChatSDK } from "chatly-sdk";
import { MongoDBUserStore } from "../adapters/mongodbUserStore.js";
import { MongoDBMessageStore } from "../adapters/mongodbMessageStore.js";
import { MongoDBGroupStore } from "../adapters/mongodbGroupStore.js";

const router = express.Router();

let sdkInstance = null;

export function initializeSDK(userCollection, messageCollection, groupCollection) {
  const sdk = new ChatSDK({
    userStore: new MongoDBUserStore(userCollection),
    messageStore: new MongoDBMessageStore(messageCollection),
    groupStore: new MongoDBGroupStore(groupCollection),
  });
  sdkInstance = sdk;
  return sdk;
}


export function getSDKInstance() {
  return sdkInstance;
}

router.post("/", async (req, res) => {
  try {
    if (!sdkInstance) {
      return res.status(500).json({ error: "SDK not initialized" });
    }

    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const users = await sdkInstance["config"].userStore.list();
    const existingUser = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const user = await sdkInstance.createUser(username);
    res.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!sdkInstance) {
      return res.status(500).json({ error: "SDK not initialized" });
    }

    const user = await sdkInstance["config"].userStore.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.get("/", async (req, res) => {
  try {
    if (!sdkInstance) {
      return res.status(500).json({ error: "SDK not initialized" });
    }

    const users = await sdkInstance["config"].userStore.list();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Search users by username
router.get("/search", async (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}, async (req, res) => {
  try {
    if (!sdkInstance) {
      return res.status(500).json({ error: "SDK not initialized" });
    }
    
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "Username query parameter is required" });
    }

    const users = await sdkInstance["config"].userStore.list();
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

router.post("/login", async (req, res) => {
  try {
    if (!sdkInstance) {
      return res.status(500).json({ error: "SDK not initialized" });
    }

    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const users = await sdkInstance["config"].userStore.list();
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
});

export default router;


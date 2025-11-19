import express from "express";
import { ChatSDK } from "chatly-sdk";

const router = express.Router();

let sdkInstance = null;

export function setSDKInstance(sdk) {
  sdkInstance = sdk;
}

// Get messages for a user
router.get("/user/:userId", async (req, res) => {
  try {
    if (!sdkInstance) {
      return res.status(500).json({ error: "SDK not initialized" });
    }

    const messages = await sdkInstance.getMessagesForUser(req.params.userId);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching user messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get messages for a group
router.get("/group/:groupId", async (req, res) => {
  try {
    if (!sdkInstance) {
      return res.status(500).json({ error: "SDK not initialized" });
    }

    const messages = await sdkInstance.getMessagesForGroup(req.params.groupId);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;


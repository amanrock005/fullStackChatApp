import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

//send is the endpoint and :id is the user to whom we want to
//write the messages to
router.post("/send/:id", protectRoute, sendMessage);

export default router;

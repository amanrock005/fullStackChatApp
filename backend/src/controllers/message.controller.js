import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../model/message.model.js";
import User from "../model/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (err) {
    console.error("error in getUsersForSidebar: ", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (err) {
    console.log("error in getMessages controller ", err.message);
    res.status(500).json({ error: "internal server error" });
  }
};

//when we send a message it could be an image or text
export const sendMessage = async (req, res) => {
  try {
    //get the text and image from the body
    const { text, image } = req.body;
    // get the id of the receiver from the url
    const { id: receivedId } = req.params;
    // who is sending the message me
    const senderId = req.user._id;
    // check if user is sending image or not
    let imageUrl;
    if (image) {
      // this will upload the iamge to cloudinary
      // cloudinary will send a response
      const uploadedResponse = await cloudinary.uploader.upload(image);
      // take the secure_url and assign it to imageUrl varialbe
      imageUrl = uploadedResponse.secure_url;
    }

    //create new message
    const newMessage = new Message({
      senderId, //us
      receivedId,
      text,
      image: imageUrl, // either undefined or actual value
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receivedId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.log("error in sendMessage controller ", err.message);
    res.status(500).json({ error: "internal server error" });
  }
};

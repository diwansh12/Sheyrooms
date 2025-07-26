const express = require("express");
const Room = require("../models/rooms"); // ← Fixed: rooms.js not room.js
const router = express.Router();

// GET ALL ROOMS
router.get("/getallrooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ROOM BY ID
router.get("/getroombyid/:roomid", async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomid);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD ROOM (Admin)
router.post("/addroom", async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.json({ message: "Room added successfully", room: newRoom });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

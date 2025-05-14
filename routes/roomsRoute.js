// In your rooms route file (e.g., routes/rooms.js)
const express = require("express");
const router = express.Router();
const Room = require("../models/rooms");

router.get("/getallrooms", async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/getroombyid/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/addroom",  async(req,res)=> {

  try{
    const newroom= new Room(req.body)
    await newroom.save()
      res.send("New room added successfully")
     }
     catch(error){
      return res.status(400).json({error});
     }
})

module.exports = router;

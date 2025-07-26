const mongoose = require("mongoose");

var mongoURL = 'mongodb+srv://diwansh12:Diwansh%40744290@cluster0.opqt1.mongodb.net/mern-rooms'

// ✅ Simplified connection without deprecated options
mongoose.connect(mongoURL)

var connection = mongoose.connection

connection.on('error', () => {
 console.log("Mongo DB Connection failed")
})

connection.on('connected', () => {
 console.log("Mongo DB Connected Successful")
})

module.exports = mongoose

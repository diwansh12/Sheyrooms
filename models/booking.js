const mongoose = require("mongoose");
const bookingSchema = mongoose.Schema({
 
 room : {
  type: String, required: true
 },
 roomId : {
  type : String, required: true
 },
 userid : {
  type : String, required: true
 },
 fromdate : {
  type : String, required: true
 },
 todate : {
  type : String, required: true
 },
 totalamount : {
  type : Number, required: true
 },
 totalDays : {
  type : Number, required: true
 },
 transactionId : {
  type : String, required: true
 },
 status :  {
  type : String, required: true, default: 'booked'
 }

},
{
 timestamps : true,
})

const bookingmodel = mongoose.model('booking', bookingSchema);
module.exports = bookingmodel
import React from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const PaypalButton = ({ amount, roomid, userid, fromdate, todate, totalamount, totalDays }) => {

 const navigate= useNavigate();
  return (
    <PayPalButtons
      style={{ layout: "vertical" }}
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: amount.toString(), // convert to string
              },
            },
          ],
        });
      }}
    onApprove={async (data, actions) => {
  const order = await actions.order.capture();
  await axios.post("/api/bookings/verify-payment", {
    orderID: data.orderID,
    roomId: roomid,
    userid,
    fromdate,
    todate,
    totalamount,
    totalDays,
  });
  navigate('/profile');
}}

      onError={(err) => {
        console.error("PayPal Checkout Error:", err);
      }}
    />
  );
};

export default PaypalButton;

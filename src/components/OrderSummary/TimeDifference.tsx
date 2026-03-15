import React, { useEffect, useState } from "react";
import {Typography} from "@mui/material";
interface TimeDifferenceProps {
  order_time: string| undefined; // e.g., "18:28:18.475867"
}

const TimeDifference: React.FC<TimeDifferenceProps> = ({ order_time }) => {
  const [runningTime, setRunningTime] = useState<string>("");

  const calculateRunningTime = () => {
    if (!order_time) return;

    // Parse the order_time (ignore microseconds if present)
    const [h, m, s] = order_time.split(":").map((v) => parseFloat(v));
    const orderDate = new Date();
    orderDate.setHours(h, m, s, 0);

    const now = new Date();

    // Handle case when order time was before midnight
    if (now < orderDate) {
      orderDate.setDate(orderDate.getDate() - 1);
    }

    const diffMs = now.getTime() - orderDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let displayText = "";

    if (diffHours > 0) {
      displayText = `${diffHours} hr${diffHours > 1 ? "s" : ""}`;
      if (diffMinutes > 0) displayText += ` ${diffMinutes} min`;
    } else if (diffMinutes > 0) {
      displayText = `${diffMinutes} min`;
    } else {
      displayText = "Just started";
    }

    setRunningTime(displayText);
  };

  useEffect(() => {
    calculateRunningTime();
    const timer = setInterval(calculateRunningTime, 60000); // update every minute
    return () => clearInterval(timer);
  }, [order_time]);

  return <Typography variant="subtitle2" sx={{width:"100%",marginTop:1, textAlign:"center"}}>{"Running : "}{runningTime}</Typography>;
};

export default TimeDifference;

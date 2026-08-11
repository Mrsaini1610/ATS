import React, { useEffect, useState } from "react";

export default function CountdownTimer({ elapsedTimeFormatted }) {
  const [displayTime, setDisplayTime] = useState(elapsedTimeFormatted);

  useEffect(() => {
    // Update the display time whenever the prop changes
    setDisplayTime(elapsedTimeFormatted);

    // Set up interval to update the display every minute (60,000 milliseconds)
    const minuteInterval = setInterval(() => {
      setDisplayTime(elapsedTimeFormatted);
    }, 60000);

    return () => clearInterval(minuteInterval);
  }, [elapsedTimeFormatted]);

  // Parse the formatted time string to extract hours and minutes
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  };

  const { hours, minutes } = parseTime(displayTime);

  const format = (v) => v.toString().padStart(2, "0");

  return (
    <div className="mt-2 flex gap-2 text-center justify-center">
      {[
        { value: hours, unit: "hours" },
        { value: minutes, unit: "minutes" }
      ].map((item, i) => (
        <div
          key={i}
          className="bg-[#5146E61A] text-[#5146E6] px-3 py-2 rounded-md shadow-sm min-w-[60px]"
        >
          <div className="text-[18px] font-bold">{format(item.value)}</div>
          <div className="text-[11px] uppercase text-[#727272]">{item.unit}</div>
        </div>
      ))}
    </div>
  );
}

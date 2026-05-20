"use client";

import { useEffect, useState } from "react";

type TimePart = {
  value: number;
  label: string;
};

function getTimeParts(date: Date): TimePart[] {
  return [
    { value: date.getHours(), label: "时" },
    { value: date.getMinutes(), label: "分" },
    { value: date.getSeconds(), label: "秒" }
  ];
}

export function HomeClockCards({ initialTime }: { initialTime: string }) {
  const [now, setNow] = useState(() => new Date(initialTime));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="grid max-w-[420px] grid-cols-3 gap-5">
      {getTimeParts(now).map((item) => (
        <div key={item.label} className="rounded-[12px] bg-[#fff4f6] px-5 py-4 text-center">
          <p className="font-number text-4xl font-light text-[#30323b]">
            {String(item.value).padStart(2, "0")}
          </p>
          <p className="mt-2 text-sm text-[#50535d]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

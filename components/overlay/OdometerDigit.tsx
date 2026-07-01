"use client";
import { useState, useEffect, useRef } from "react";

interface OdometerDigitProps {
  digit: number;    // 0–9
  duration: number; // animation duration in ms
  delay: number;    // cascade delay in ms (applied via JS timeout, not CSS)
}

export default function OdometerDigit({ digit, duration, delay }: OdometerDigitProps) {
  const [current, setCurrent] = useState(digit);
  const [next, setNext] = useState<number | null>(null);
  const isFirst = useRef(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // duration/delay are captured from the same render via closure when digit changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }

    timers.current.forEach(clearTimeout);
    timers.current = [];

    const d = duration;
    const dl = delay;

    const t1 = setTimeout(() => {
      setNext(digit);
      const t2 = setTimeout(() => {
        setCurrent(digit);
        setNext(null);
      }, d + 16);
      timers.current.push(t2);
    }, dl);
    timers.current.push(t1);

    return () => timers.current.forEach(clearTimeout);
  }, [digit]); // intentionally omits duration/delay — captured at change time via closure

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
        height: "1em",
        lineHeight: 1,
        verticalAlign: "baseline",
      }}
    >
      <span
        style={{
          display: "inline-block",
          lineHeight: 1,
          animation: next !== null ? `odometer-out ${duration}ms ease-out both` : "none",
        }}
      >
        {current}
      </span>
      {next !== null && (
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            textAlign: "center",
            lineHeight: 1,
            animation: `odometer-in ${duration}ms ease-out both`,
          }}
        >
          {next}
        </span>
      )}
    </span>
  );
}

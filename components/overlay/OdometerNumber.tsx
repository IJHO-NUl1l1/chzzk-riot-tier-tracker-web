"use client";
import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import OdometerDigit from "./OdometerDigit";

interface OdometerNumberProps {
  value: number;
  style?: CSSProperties;
}

function calcParams(diff: number): { duration: number; cascadeDelay: number } {
  if (diff >= 100) return { duration: 700, cascadeDelay: 50 };
  if (diff >= 10)  return { duration: 500, cascadeDelay: 25 };
  return { duration: 350, cascadeDelay: 0 };
}

export default function OdometerNumber({ value, style }: OdometerNumberProps) {
  const prevRef = useRef(value);
  const [params, setParams] = useState({ duration: 350, cascadeDelay: 0 });
  const [displayed, setDisplayed] = useState(value);

  useEffect(() => {
    const diff = Math.abs(value - prevRef.current);
    prevRef.current = value;
    if (diff === 0) return;
    setParams(calcParams(diff));
    setDisplayed(value);
  }, [value]);

  const str = String(Math.max(0, displayed));
  const digits = str.split("").map(Number);
  const n = digits.length;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {digits.map((d, posFromLeft) => {
        const posFromRight = n - 1 - posFromLeft;
        return (
          <OdometerDigit
            key={posFromRight}
            digit={d}
            duration={params.duration}
            delay={posFromLeft * params.cascadeDelay}
          />
        );
      })}
    </span>
  );
}

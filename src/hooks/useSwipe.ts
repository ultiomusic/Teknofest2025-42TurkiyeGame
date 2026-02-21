import { useEffect, useRef } from "react";
import type { Direction } from "../types/game";
import { SWIPE_THRESHOLD } from "../game/constants";

export function useSwipe<T extends HTMLElement>(onSwipe: (direction: Direction) => void) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;

    const handleStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const handleEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) < SWIPE_THRESHOLD) {
        return;
      }

      if (absX > absY) {
        onSwipe(dx > 0 ? "right" : "left");
      } else {
        onSwipe(dy > 0 ? "down" : "up");
      }
    };

    element.addEventListener("touchstart", handleStart, { passive: true });
    element.addEventListener("touchend", handleEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleStart);
      element.removeEventListener("touchend", handleEnd);
    };
  }, [onSwipe]);

  return ref;
}

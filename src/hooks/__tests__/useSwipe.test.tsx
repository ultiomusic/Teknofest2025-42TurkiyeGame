import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { useSwipe } from "../useSwipe";

function SwipeHarness() {
  const [value, setValue] = useState("none");
  const ref = useSwipe<HTMLDivElement>((direction) => setValue(direction));

  return (
    <div>
      <div ref={ref} data-testid="swipe-area" />
      <output>{value}</output>
    </div>
  );
}

describe("useSwipe", () => {
  it("saga kaydirma hareketini algilar", () => {
    render(<SwipeHarness />);
    const area = screen.getByTestId("swipe-area");

    fireEvent.touchStart(area, {
      changedTouches: [{ clientX: 10, clientY: 10 }],
    });

    fireEvent.touchEnd(area, {
      changedTouches: [{ clientX: 90, clientY: 12 }],
    });

    expect(screen.getByText("right")).toBeInTheDocument();
  });
});

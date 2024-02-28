import { getCounterRotationStyle } from "./NodeComponent";

describe("getCounterRotationStyle", () => {
  it("should return the counter rotation style", () => {
    const rotationStyle = "rotate(1.8325956209839993rad)";
    const expectedCounterRotationStyle = "rotate(-1.8325956209839993rad)";

    const counterRotationStyle = getCounterRotationStyle(rotationStyle);

    expect(counterRotationStyle).toBe(expectedCounterRotationStyle);
  });

  it("should return the same rotation style if no rotation match is found", () => {
    const rotationStyle = "scale(1.5)";

    const counterRotationStyle = getCounterRotationStyle(rotationStyle);

    expect(counterRotationStyle).toBe(rotationStyle);
  });
});

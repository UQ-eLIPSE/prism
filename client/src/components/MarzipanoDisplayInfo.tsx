import React from "react";
import { InitialViewParameters } from "../interfaces/NodeData";

interface MarzipanoDisplayInfoProps {
  viewParams: InitialViewParameters;
}

const MarzipanoDisplayInfo = ({ viewParams }: MarzipanoDisplayInfoProps) => {
  const { yaw, pitch, fov } = viewParams;
  return (
    <div className="marzipano-info">
      <p>{`Pitch (Tilt): ${pitchToDeg(pitch)}\u00B0`}</p>
      <p>{`Yaw (Rotation): ${radToDeg(yaw)}\u00B0`}</p>
      <p>{`Fov (Zoom): ${fovToPercent(fov, { min: 0.73, max: 1.2 })}%`}</p>
    </div>
  );
};

// Helpers
function radToDeg(radians: number): number {
  return Math.round(((radians * 180) / Math.PI) * 100) / 100;
}

function pitchToDeg(pitch: number): number {
  return Math.round(90 - radToDeg(pitch));
}

function fovToPercent(
  fov: number,
  range: { min: number; max: number },
): number {
  const { min, max } = range;
  return Math.min(Math.round(((fov - min) / (max - min)) * 100), 100);
}

export default MarzipanoDisplayInfo;

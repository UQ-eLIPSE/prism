import React from "react";
import { InitialViewParameters } from "../interfaces/NodeData";

function radToDeg(radians: number): number {
  return Math.round(((radians * 180) / Math.PI) * 100) / 100;
}

function pitchToDeg(pitch: number): number {
  const degrees = Math.round(((pitch * 180) / Math.PI) * 100) / 100;
  return Math.round(90 - degrees);
}

interface MarzipanoDisplayInfoProps {
  viewParams: InitialViewParameters;
}

const MarzipanoDisplayInfo = ({ viewParams }: MarzipanoDisplayInfoProps) => {
  const { yaw, pitch, fov } = viewParams;
  return (
    <>
      <p>{`Pitch (tilt): ${pitchToDeg(pitch)}\u00B0`}</p>
      <p>{`Yaw (rotation): ${radToDeg(parseFloat(yaw.toFixed(2)))}\u00B0`}</p>
      <p>{`Field of View: ${parseFloat(fov.toFixed(2))}\u00B0`}</p>
    </>
  );
};
export default MarzipanoDisplayInfo;

import React from "react";
import { MinimapUpdateProps } from "../interfaces/MinimapImages";

const MinimapUpdate = ({
  setMapHover,
  setSelectedImage,
  setImageUrl,
  setPendingUpload,
  mapHover,
  imageUrl,
  minimapdata,
}: MinimapUpdateProps): JSX.Element => {
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLDivElement) {
      setMapHover(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setMapHover(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.includes("image/")) {
      setSelectedImage(file);
      setImageUrl(URL.createObjectURL(file));
      setPendingUpload(true);
    }
  };

  const dragDropClass = mapHover
    ? "displayed light dropUpload"
    : `${!imageUrl || !minimapdata ? "displayed" : "light"}`;
  const iconClass = `fa-solid ${mapHover ? "fa-cloud-arrow-up" : "fa-file-image"}`;
  const messageText = mapHover
    ? "Drop Image to Upload"
    : "Upload Minimap Image";
  const dropUploadHoverClass = mapHover ? "dropUploadHover" : "";

  return (
    <div
      className="minimap-drag-drop"
      onDragOver={(e) => {
        e.preventDefault();
        setMapHover(true);
      }}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="drop-zone"
    >
      <label className={dragDropClass} htmlFor="select-image">
        <span className={dropUploadHoverClass}>
          <i className={iconClass}></i>
          <p>{messageText}</p>
        </span>
      </label>
    </div>
  );
};

export default MinimapUpdate;

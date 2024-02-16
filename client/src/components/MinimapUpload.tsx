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
      <label
        className={
          mapHover
            ? "displayed light dropUpload"
            : `${!imageUrl || !minimapdata ? "displayed" : "light"}`
        }
        htmlFor="select-image"
      >
        <span className={`${mapHover && "dropUploadHover"}`}>
          <i
            className={`fa-solid ${
              mapHover ? "fa-cloud-arrow-up" : "fa-file-image"
            }`}
          ></i>
          <p>{mapHover ? "Drop Image to Upload" : "Upload Minimap Image"}</p>
        </span>
      </label>
    </div>
  );
};

export default MinimapUpdate;

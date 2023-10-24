import React from "react";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import NetworkCalls from "../../../utils/NetworkCalls";

export interface ImageDragDropInterface {
  image: string;
  setImage: (value: string) => void;
}

/**
 * This component renders the drag and drop an image component found in modals (sitepin)
 * @param image the image that possibly already exists for a pin
 * @param setImage setting a new image to a pin
 * @returns a image drag and drop component
 */
function ImageDragDrop(props: ImageDragDropInterface) {
  const { image, setImage } = props;
  const [isHovered, setIsHovered] = useState<boolean>(false);

  /*
   * Uploads a user-submitted image to the server. Sets the image url state (setImage) to the returned image URL.
   */
  async function uploadImage(image: File) {
    try {
      const imageUploadReq = await NetworkCalls.updatePreviewImage(image);
      if (imageUploadReq.success) {
        setImage(imageUploadReq.payload.url);
      } else {
        throw "- Image could not be uploaded to server";
      }
    } catch (e) {
      window.alert(`Error! \n\n Failed to Add Pin. \n ${e}`);
    }
  }

  return (
    <div
      className="image-preview"
      style={{ backgroundImage: image && `url(${image})` }}
      onDrop={(e) => {
        if (
          e.dataTransfer.files[0] &&
          e.dataTransfer.files[0].type.includes("image/")
        ) {
          uploadImage(e.dataTransfer.files[0]);
        }
        setIsHovered(false);
      }}
      onDragOver={() => setIsHovered(true)}
      onDragLeave={(e) => {
        if (e.target instanceof HTMLDivElement) {
          setIsHovered(false);
        }
      }}
    >
      <label
        className={
          isHovered
            ? "displayed light dropUpload"
            : `${!image ? "displayed" : "light"}`
        }
        htmlFor="uploadImg"
      >
        <span className={`${isHovered && "dropUploadHover"}`}>
          <i
            className={`fa-solid ${
              isHovered ? "fa-cloud-arrow-up" : "fa-file-image"
            }`}
          ></i>
          <p id="image-text">
            {isHovered
              ? "Drop Image to Upload"
              : `${image ? "Change" : "Upload"} Image`}
          </p>
          {!isHovered && (
            <div>
              <FormattedMessage id="selectImage" />
            </div>
          )}
        </span>
      </label>
      <input
        onChange={(e) => {
          if (e.target.files?.[0]) {
            uploadImage(e.target.files?.[0]);
          }
        }}
        type="file"
        name="uploadImg"
        id="uploadImg"
        accept="image/*"
      />
    </div>
  );
}

export default ImageDragDrop;

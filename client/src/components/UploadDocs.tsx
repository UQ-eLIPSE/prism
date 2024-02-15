import DocumentationStyles from "../sass/partials/_documentation.module.scss";
import React, { useState, ChangeEvent, FormEvent } from "react";
import NetworkCalls from "../utils/NetworkCalls";

interface UploadDocsProps {
  siteId: string;
}

const UploadDocs: React.FC<UploadDocsProps> = ({ siteId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files.length > 0  ? event.target.files[0] : null;
    if (
      file &&
      (file.type === "application/zip" || file.name.endsWith(".zip"))
    ) {
      setSelectedFile(file);
    } else {
      alert("Please select a ZIP file.");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("Please select a file before submitting.");
      return;
    }

    setIsLoading(true);
    setUploadSuccess(false);
    try {
      await NetworkCalls.uploadDocument(selectedFile, siteId);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setSelectedFile(null);
      }, 1000);
    } catch (error) {
      alert("Failed to upload file.");
      setUploadSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={DocumentationStyles.form}>
      <label htmlFor="uploadZip">Upload documents .zip</label>
      <div className="buttons">
        <input
          data-cy="browse-computer"
          className="nav-text"
          type="file"
          onChange={handleFileChange}
          accept=".zip"
          id="uploadZip"
          name="uploadZip"
        />
        {isLoading ? (
          <div className={DocumentationStyles.loader}></div>
        ) : uploadSuccess ? (
          <div className={DocumentationStyles.successIndicator}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="green"
              viewBox="0 0 16 16"
              className={DocumentationStyles.boldCheckmark}
            >
              <path d="M13.485 1.85a.5.5 0 0 1 .515.857l-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 9.293l7.036-7.036a.5.5 0 0 1 .707 0z" />
            </svg>
          </div>
        ) : (
          <>
            <button
              data-cy="submit-documentation"
              className="nav-text"
              type="submit"
            >
              Submit
            </button>
            <button
              className="nav-text"
              type="button"
              onClick={() => setSelectedFile(null)}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
};

export default UploadDocs;

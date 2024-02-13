import DocumentationStyles from "../sass/partials/_documentation.module.scss";
import React, { useState, ChangeEvent, FormEvent } from "react";
import NetworkCalls from "../utils/NetworkCalls"; // Ensure this path matches your project structure

interface UploadDocsProps {
  siteId: string;
}

const UploadDocs: React.FC<UploadDocsProps> = ({ siteId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
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

    try {
      const response = await NetworkCalls.uploadDocument(selectedFile, siteId);
      console.log("Upload successful:", response);
      alert("File uploaded successfully.");
    } catch (error) {
      alert("Failed to upload file.");
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
        />
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
      </div>
    </form>
  );
};

export default UploadDocs;

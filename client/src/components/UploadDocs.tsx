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
    <div>
      upload
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".zip" />
        <button type="submit">Submit</button>
        <button type="button" onClick={() => setSelectedFile(null)}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default UploadDocs;

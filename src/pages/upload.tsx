import { NextPage } from "next";
import { useDropzone } from "react-dropzone";

import { useUser } from "../components/Auth";

const UploadPage: NextPage = () => {
  const { loading, user } = useUser("upload");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: () => {},
  });
  if (loading || !user) {
    return null;
  }

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
};

export default UploadPage;

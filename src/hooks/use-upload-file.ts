import React from "react";
import { toast } from "sonner";
import { z } from "zod";

import { generateReactHelpers } from "@uploadthing/react";

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
  headers?: Record<string, string>;
  onUploadBegin?: (fileName: string) => void;
  onUploadProgress?: (progress: { progress: number }) => void;
  skipPolling?: boolean;
}

interface UploadedFile {
  key: string; // Unique identifier
  url: string; // Public URL of the uploaded file
  name: string; // Original filename
  size: number; // File size in bytes
  type: string; // MIME type
}

export function getErrorMessage(err: unknown) {
  const unknownError = "Something went wrong, please try again later.";
  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => {
      return issue.message;
    });
    return errors.join("\n");
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return unknownError;
  }
}

export const { uploadFiles, useUploadThing } = generateReactHelpers({
  url: "/api/uploadthing",
  fetch: async (input, init) => {
    try {
      console.info("[UploadThing] fetch →", input, init?.method);
      const res = await fetch(input, init);
      if (!res.ok) {
        console.error(
          "[UploadThing] fetch error status",
          res.status,
          await res.text()
        );
      }
      return res;
    } catch (e) {
      console.error("[UploadThing] fetch threw", e);
      throw e;
    }
  },
});

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  onUploadProgress,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);
  async function uploadThing(file: File) {
    console.log("tasetase");
    setIsUploading(true);
    setUploadingFile(file);
    try {
      const res = await uploadFiles("imageUploader", {
        files: [file],
        onUploadProgress: ({ progress }) => {
          setProgress(Math.min(progress, 100));
        },
      });
      setUploadedFile(res[0]);
      onUploadComplete?.(res[0]);
      return uploadedFile;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const message =
        errorMessage.length > 0
          ? errorMessage
          : "Something went wrong, please try again later.";
      toast.error(message);
      onUploadError?.(error);
      // Mock upload for unauthenticated users
      // toast.info('User not logged in. Mocking upload process.');
      const mockUploadedFile = {
        key: "mock-key-0",
        appUrl: `https://mock-app-url.com/${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      } as UploadedFile;
      // Simulate upload progress
      let progress = 0;
      const simulateProgress = async () => {
        while (progress < 100) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          progress += 2;
          setProgress(Math.min(progress, 100));
        }
      };
      await simulateProgress();
      setUploadedFile(mockUploadedFile);
      return mockUploadedFile;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }
  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile: uploadThing,
    uploadingFile,
  };
}

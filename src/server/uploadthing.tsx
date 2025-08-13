import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadError((error) => {
      console.error("Upload error:", error);
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete for file:", file.name);

      // You can return just the key
      return { ufsUrl: `https://utfs.io/f/${file.key}` };

      // OR if you want to return the public URL directly from the server:
      // return { url: `https://utfs.io/f/${file.key}` };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof fileRouter;

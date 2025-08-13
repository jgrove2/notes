import { fileRouter } from "../../server/uploadthing";
import { createRouteHandler } from "uploadthing/server"; // works outside Next.js too
import { createServerFileRoute } from "@tanstack/react-start/server";
import crypto from "node:crypto";

const handler = createRouteHandler({
  router: fileRouter,
});

export const ServerRoute = createServerFileRoute("/api/test" as never).methods({
  GET: (req) => {
    console.log(req);
    console.log(import.meta.env.UPLOADTHING_TOKEN);
    console.log(crypto.randomUUID());
    return new Response("Hello, world!");
  },
});

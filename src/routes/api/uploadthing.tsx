import { fileRouter } from "../../server/uploadthing";
import { createRouteHandler } from "uploadthing/server"; // works outside Next.js too
import { createServerFileRoute } from "@tanstack/react-start/server";
import crypto from "node:crypto";

const handler = createRouteHandler({
  router: fileRouter,
});

export const ServerRoute = createServerFileRoute(
  "/api/uploadthing" as never
).methods({
  GET: handler,
  POST: handler,
});

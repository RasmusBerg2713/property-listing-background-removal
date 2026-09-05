import { createServer } from "node:http";
import { prepareListing } from "./property_listing.js";

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/listings/process") { res.writeHead(404).end(); return; }
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const result = await prepareListing(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: true, data: result }));
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : 422;
    res.writeHead(status, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: false, error: { message: error instanceof Error ? error.message : "Invalid request" } }));
  }
});

server.listen(Number(process.env.PORT ?? 3000), () => console.log("listing service listening"));

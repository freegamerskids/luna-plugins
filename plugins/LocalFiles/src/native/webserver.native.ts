import { Hono } from "hono"
import { cors } from "hono/cors"
import { serve, ServerType } from "@hono/node-server"
import { loadFile } from "./fs.native";

const app = new Hono();
let server: ServerType;

export function startWebserver(port: number) {
    app.use(cors());

    app.get("/:file{.*}", async (c) => {
        const file = await loadFile(decodeURIComponent(c.req.param("file")));
        if (file === false) {
            return c.json({ error: "File not found" }, 404);
        }
        return c.body(file);
    });

    server = serve({
        fetch: app.fetch,
        port,
    });
}

export function stopWebserver() {
    server.close();
}
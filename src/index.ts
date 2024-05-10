import { Hono } from "hono";
import indexHTML from "./index.html";

const app = new Hono<Environment>();

app.get("/", c => c.html(indexHTML));

app.get("/ws", async c => {
	const upgradeHeader = c.req.header("upgrade");
	if (!upgradeHeader || upgradeHeader !== "websocket") {
		return c.text("Expected WebSocket upgrade", 429);
	}
	return c.env.DO.get(c.env.DO.newUniqueId()).fetch(c.req.raw);
});

app.get("/count/:id", async c => {
	const { id } = c.req.param();
	try {
		const countRes = await c.env.DO.get(c.env.DO.idFromString(id)).getCount();
		console.log(countRes);
		return c.json(countRes);
	} catch(e) {
		return c.json({ error: "Invalid ID" }, 400);
	}
});

export default app;
export { DO } from "./DO";
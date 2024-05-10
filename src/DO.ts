import { DurableObject } from "cloudflare:workers";
export class DO extends DurableObject {
	private counter?: number;
	constructor(private readonly state: DurableObjectState, env: Environment["Bindings"]) {
		super(state, env);
		this.state.blockConcurrencyWhile(async () => {
			const maybeCounter = await this.state.storage.get<number>("counter");
			if(maybeCounter) {
				this.counter = maybeCounter;
			}
		});
	}
	async getCount() {
		return {
			id: this.state.id.toString(),
			counter: this.counter
		};
	}
	async fetch(_: Request): Promise<Response> {
    const [client, server] = Object.values(new WebSocketPair());
		this.state.acceptWebSocket(server);
		server.send(this.state.id.toString());
		return new Response(null, {
      status: 101,
      webSocket: client,
    });
	}
	async webSocketMessage(_: WebSocket, message: string | ArrayBuffer) {
		if(typeof message !== "string") {
			return;
		}
		if(this.counter) {
			this.counter++;
		} else {
			this.counter = 1;
		}
		this.state.storage.put("counter", this.counter);
		await this.state.storage.put("message/" + this.counter, message);
	}
}
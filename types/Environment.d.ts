import type { DO } from "../src/DO";
declare global {
	type Environment = {
		Bindings: {
			DO: DurableObjectNamespace<DO>
		}
	};
}
export {};
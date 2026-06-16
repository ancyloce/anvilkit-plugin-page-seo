import { describe, expect, it, vi } from "vitest";
import { createPageSeoPlugin } from "../index.js";

describe("createPageSeoPlugin", () => {
	it("returns a StudioPlugin declaring the sidebar capability", () => {
		const plugin = createPageSeoPlugin();
		expect(plugin.meta.capabilities).toEqual({ sidebar: true });
		expect(typeof plugin.register).toBe("function");
	});

	it("registers the i18n catalog + SEO panel and cleans up on destroy", () => {
		const registerMessages = vi.fn();
		const unregister = vi.fn();
		const registerSeoPanel = vi.fn(() => unregister);
		const ctx = { registerMessages, registerSeoPanel } as never;

		const plugin = createPageSeoPlugin();
		const registration = plugin.register(ctx);

		expect(registerMessages).toHaveBeenCalledTimes(1);
		expect(registerSeoPanel).toHaveBeenCalledTimes(1);

		// The registered panel exposes a render() thunk (a ReactNode factory).
		const panel = (registerSeoPanel.mock.calls[0]?.[0] ?? {}) as {
			render: () => unknown;
		};
		expect(typeof panel.render).toBe("function");

		// onDestroy unregisters the panel exactly once.
		registration.hooks?.onDestroy?.(ctx);
		expect(unregister).toHaveBeenCalledTimes(1);
	});

	it("no-ops the panel registration when the host lacks registerSeoPanel", () => {
		const registerMessages = vi.fn();
		const ctx = { registerMessages } as never;
		const plugin = createPageSeoPlugin();
		expect(() => plugin.register(ctx)).not.toThrow();
	});
});

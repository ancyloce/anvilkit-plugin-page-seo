import type { StudioPlugin, StudioPluginLifecycleHooks } from "@anvilkit/core";
import { createElement } from "react";
import config from "../meta/config.json" with { type: "json" };
import packageJson from "../package.json" with { type: "json" };
import { PAGE_SEO_ENTRY } from "./i18n/entry.js";
import { PageSeoPanel } from "./panel/PageSeoPanel.js";

// No `meta.icon` — the rail tab icon comes from core's RAIL_MODULES (F5.1),
// so the plugin avoids a `lucide-react` dependency.
const META = {
	...config,
	version: packageJson.version,
} as const;

/**
 * Create the Page SEO plugin (PRD 0004 F5). Contributes a sidebar rail panel
 * that edits `root.props.seo` via the core `registerSeoPanel` seam. Returns a
 * `StudioPlugin`; its `register` wires the i18n catalog + panel and cleans both
 * up on `onDestroy`.
 */
export function createPageSeoPlugin(): StudioPlugin {
	return {
		meta: META,
		register(ctx) {
			ctx.registerMessages?.(PAGE_SEO_ENTRY);

			let unregisterPanel: (() => void) | undefined;
			if (typeof ctx.registerSeoPanel === "function") {
				unregisterPanel = ctx.registerSeoPanel({
					render: () => createElement(PageSeoPanel),
				});
			}

			const onDestroy: NonNullable<
				StudioPluginLifecycleHooks["onDestroy"]
			> = () => {
				unregisterPanel?.();
				unregisterPanel = undefined;
			};

			return { meta: META, hooks: { onDestroy } };
		},
	};
}

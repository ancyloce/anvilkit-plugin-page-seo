import type { RegistryEntry } from "@anvilkit/core/i18n";
import enMessages from "../../i18n/messages/en.json" with { type: "json" };

/**
 * The plugin's i18n catalog, registered via `ctx.registerMessages`. English
 * ships inline; this MVP carries no other locale packs, so `loadMessages`
 * resolves to an empty map and consumers fall back to the `en` strings.
 */
export const PAGE_SEO_ENTRY: RegistryEntry = {
	namespace: "pageSeo",
	en: enMessages,
	loadMessages: async () => ({}),
};

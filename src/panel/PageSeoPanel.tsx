// This plugin builds CLASSIC JSX (`React.createElement`) — every `.tsx` must
// bind `React` explicitly or dist throws "React is not defined" at runtime.
import * as React from "react";
import { useMsg } from "@anvilkit/core/i18n";
import { createUsePuck, type useGetPuck } from "@puckeditor/core";
import type { CSSProperties, ReactElement } from "react";

/**
 * `createUsePuck()` builds a selector-aware hook so this panel re-renders only
 * when the slice it projects (`appState.data`) changes by `Object.is`, not on
 * every unrelated Puck state change (selection, drag, transient UI). A bare
 * `usePuck()` subscribes to the whole snapshot and re-renders on all of them.
 *
 * The hook is built lazily at first call (module-scoped singleton) so partial
 * test mocks of `@puckeditor/core` do not crash importers at module-evaluate
 * time; after the first call the same hook reference is invoked unconditionally
 * every render, satisfying the Rules of Hooks. Mirrors `@anvilkit/core`'s
 * `useReactivePuck`.
 */
type PuckSnapshot = ReturnType<ReturnType<typeof useGetPuck>>;
let _usePuck: ReturnType<typeof createUsePuck> | null = null;
function usePuckSlice<TResult>(selector: (snapshot: PuckSnapshot) => TResult): TResult {
	if (_usePuck === null) {
		_usePuck = createUsePuck();
	}
	return _usePuck(selector);
}

/** The SEO sub-shape this panel edits (mirrors `@anvilkit/schema` `PageSeo`). */
interface PageSeoLike {
	title?: string;
	description?: string;
	ogImage?: string;
	canonical?: string;
	noIndex?: boolean;
}

const containerStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "12px",
	padding: "4px",
};
const fieldStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "4px",
	fontSize: "12px",
};
const inputStyle: CSSProperties = {
	padding: "6px 8px",
	borderRadius: "6px",
	border: "1px solid var(--ak-studio-border, #d4d4d8)",
	fontSize: "13px",
};
const checkboxRowStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: "8px",
	fontSize: "12px",
};

/**
 * Page SEO form. Reads the active page's `root.props.seo` reactively from Puck
 * and writes each edit back as an immutable `setData` dispatch (so the change
 * lands in `appState.data` — the single source of truth read by the validator,
 * storage gateway, and SEO render route).
 */
export function PageSeoPanel(): ReactElement {
	const msg = useMsg();
	// Narrow selectors: `data` is the only slice this panel reads, and `dispatch`
	// is referentially stable — so the panel re-renders on page-data edits only.
	const data = usePuckSlice((s) => s.appState.data);
	const dispatch = usePuckSlice((s) => s.dispatch);
	const rootProps = (data.root.props ?? {}) as Record<string, unknown> & {
		seo?: PageSeoLike;
	};
	const seo: PageSeoLike = rootProps.seo ?? {};

	const update = (patch: Partial<PageSeoLike>): void => {
		const nextSeo: PageSeoLike = { ...seo, ...patch };
		// Puck's default snapshot types `root.props` as `{ title?: string }`,
		// which has no `seo`; the page model widens it. Build a complete next
		// snapshot and cast it back to the editor's `Data` type so the immutable
		// `setData` merge overwrites `root.props` wholesale.
		const nextData = {
			...data,
			root: { ...data.root, props: { ...rootProps, seo: nextSeo } },
		} as typeof data;
		dispatch({ type: "setData", data: () => nextData });
	};

	return (
		<div style={containerStyle} aria-label={msg("pageSeo.panel.aria")} data-testid="page-seo-panel">
			<label style={fieldStyle}>
				{msg("pageSeo.field.title")}
				<input
					style={inputStyle}
					data-testid="page-seo-title"
					value={seo.title ?? ""}
					onChange={(e) => update({ title: e.target.value })}
				/>
			</label>
			<label style={fieldStyle}>
				{msg("pageSeo.field.description")}
				<textarea
					style={{ ...inputStyle, minHeight: "56px", resize: "vertical" }}
					data-testid="page-seo-description"
					value={seo.description ?? ""}
					onChange={(e) => update({ description: e.target.value })}
				/>
			</label>
			<label style={fieldStyle}>
				{msg("pageSeo.field.ogImage")}
				<input
					style={inputStyle}
					data-testid="page-seo-og-image"
					value={seo.ogImage ?? ""}
					onChange={(e) => update({ ogImage: e.target.value })}
				/>
			</label>
			<label style={fieldStyle}>
				{msg("pageSeo.field.canonical")}
				<input
					style={inputStyle}
					data-testid="page-seo-canonical"
					value={seo.canonical ?? ""}
					onChange={(e) => update({ canonical: e.target.value })}
				/>
			</label>
			<label style={checkboxRowStyle}>
				<input
					type="checkbox"
					data-testid="page-seo-noindex"
					checked={seo.noIndex ?? false}
					onChange={(e) => update({ noIndex: e.target.checked })}
				/>
				{msg("pageSeo.field.noIndex")}
			</label>
		</div>
	);
}

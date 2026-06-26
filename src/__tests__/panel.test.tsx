// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const dispatch = vi.fn();
const baseData = {
	root: { props: { seo: { noIndex: false } } },
	content: [],
	zones: {},
};

vi.mock("@puckeditor/core", () => ({
	// `createUsePuck()` returns a selector hook; the mock applies the caller's
	// selector to a static snapshot so `usePuckSlice((s) => s.appState.data)` and
	// `usePuckSlice((s) => s.dispatch)` resolve without a real `<Puck>` provider.
	createUsePuck: () => (selector: (s: unknown) => unknown) =>
		selector({ appState: { data: baseData }, dispatch }),
}));
vi.mock("@anvilkit/core/i18n", () => ({
	useMsg: () => (key: string) => key,
}));

import { PageSeoPanel } from "../panel/PageSeoPanel.js";

describe("PageSeoPanel", () => {
	it("dispatches an immutable root.props.seo update on a field edit (F5)", () => {
		render(<PageSeoPanel />);
		fireEvent.change(screen.getByTestId("page-seo-title"), {
			target: { value: "Home — Acme" },
		});
		expect(dispatch).toHaveBeenCalledTimes(1);
		const action = dispatch.mock.calls[0]?.[0] as {
			type: string;
			data: () => { root: { props: { seo: Record<string, unknown> } } };
		};
		expect(action.type).toBe("setData");
		const next = action.data();
		expect(next.root.props.seo).toEqual({ noIndex: false, title: "Home — Acme" });
		// Immutability: the original snapshot is untouched.
		expect(baseData.root.props.seo).toEqual({ noIndex: false });
	});

	it("toggles noIndex on the seo block", () => {
		render(<PageSeoPanel />);
		fireEvent.click(screen.getByTestId("page-seo-noindex"));
		const action = dispatch.mock.calls.at(-1)?.[0] as {
			data: () => { root: { props: { seo: { noIndex: boolean } } } };
		};
		expect(action.data().root.props.seo.noIndex).toBe(true);
	});
});

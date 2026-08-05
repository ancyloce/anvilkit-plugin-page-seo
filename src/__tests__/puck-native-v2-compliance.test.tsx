// @vitest-environment jsdom
import * as React from "react";

/**
 * @file PLAN-0025 Phase 3.5 (P3.5-06) — Puck-native v2 verification.
 *
 * The plan expects no behavior change here: this plugin already IS the
 * root-props projection pattern v2 generalizes (immutable functional
 * `setData` on `root.props.seo`). Locked:
 *
 * 1. source scan: no sidecar / sidecar-editor-command reference
 *    (plan §15 gate 3, per package);
 * 2. coexistence: an seo edit on a v2 document PRESERVES the sibling
 *    `designSystem` and `componentLibrary` root props byte-identically.
 */

import "@testing-library/jest-dom/vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const dispatch = vi.fn();
const designSystem = {
	version: "1",
	breakpoints: [],
	tokens: {},
	tokenModes: { light: { id: "light", name: "Light" } },
	defaultTokenMode: "light",
	styleDefinitions: {},
};
const componentLibrary = { version: "1", definitions: {} };
const v2Data = {
	root: {
		props: {
			seo: { noIndex: false },
			designSystem,
			componentLibrary,
			title: "Page",
		},
	},
	content: [],
	zones: {},
};

vi.mock("@puckeditor/core", () => ({
	createUsePuck: () => (selector: (s: unknown) => unknown) =>
		selector({ appState: { data: v2Data }, dispatch }),
}));
vi.mock("@anvilkit/core/i18n", () => ({
	useMsg: () => (key: string) => key,
}));

import { PageSeoPanel } from "../panel/PageSeoPanel.js";

const FORBIDDEN = [
	"__anvilkit",
	"readAuthoringState",
	"writeAuthoringState",
	"ANVILKIT_AUTHORING_KEY",
	"EditorCommandPort",
	"applyEditorCommand",
	'"replaceRoot"',
] as const;

function sourceFiles(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === "__tests__") continue;
			files.push(...sourceFiles(path));
			continue;
		}
		if (/\.(ts|tsx)$/.test(entry.name)) files.push(path);
	}
	return files;
}

describe("Puck-native v2 compliance (P3.5-06)", () => {
	it("no source file references the sidecar or sidecar editor commands", () => {
		const offenders: string[] = [];
		for (const file of sourceFiles(join(__dirname, ".."))) {
			const source = readFileSync(file, "utf8");
			for (const marker of FORBIDDEN) {
				if (source.includes(marker)) offenders.push(`${file}: ${marker}`);
			}
		}
		expect(offenders).toEqual([]);
	});

	it("an seo edit preserves sibling v2 root props byte-identically", () => {
		render(<PageSeoPanel />);
		fireEvent.change(screen.getByTestId("page-seo-title"), {
			target: { value: "Home — Acme" },
		});
		const action = dispatch.mock.calls.at(-1)?.[0] as {
			type: string;
			data: () => { root: { props: Record<string, unknown> } };
		};
		expect(action.type).toBe("setData");
		const next = action.data();
		expect(next.root.props.seo).toEqual({
			noIndex: false,
			title: "Home — Acme",
		});
		// The v2 document-level carriers ride through untouched.
		expect(next.root.props.designSystem).toEqual(designSystem);
		expect(next.root.props.componentLibrary).toEqual(componentLibrary);
		expect(next.root.props.title).toBe("Page");
		// Input immutability.
		expect(v2Data.root.props.designSystem).toEqual(designSystem);
	});
});

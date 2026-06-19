// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@anvilkit/core/i18n", () => ({
	useMsg: () => (key: string) => key,
}));

import { PageSettingsSeoFields } from "../panel/PageSettingsSeoFields.js";

describe("PageSettingsSeoFields", () => {
	it("merges a metaTitle edit into the controlled value (M4)", () => {
		const onChange = vi.fn();
		render(
			<PageSettingsSeoFields value={{ metaTitle: "About" }} onChange={onChange} />,
		);
		fireEvent.change(screen.getByTestId("page-settings-seo-meta-title"), {
			target: { value: "About — Acme" },
		});
		expect(onChange).toHaveBeenCalledWith({ metaTitle: "About — Acme" });
	});

	it("edits canonical without dropping other fields (M3 follow-up)", () => {
		const onChange = vi.fn();
		render(
			<PageSettingsSeoFields
				value={{ metaTitle: "About", noindex: true }}
				onChange={onChange}
			/>,
		);
		fireEvent.change(screen.getByTestId("page-settings-seo-canonical"), {
			target: { value: "https://example.com/about" },
		});
		expect(onChange).toHaveBeenCalledWith({
			metaTitle: "About",
			noindex: true,
			canonical: "https://example.com/about",
		});
	});

	it("toggles noindex on the controlled value", () => {
		const onChange = vi.fn();
		render(<PageSettingsSeoFields value={{}} onChange={onChange} />);
		fireEvent.click(screen.getByTestId("page-settings-seo-noindex"));
		expect(onChange).toHaveBeenCalledWith({ noindex: true });
	});
});

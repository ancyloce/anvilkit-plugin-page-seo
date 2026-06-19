// This plugin's `.tsx` must bind `React` explicitly (repo classic-JSX guard);
// harmless under the automatic JSX runtime this package actually builds with.
import * as React from "react";
import type { StudioPageSettingsSeoFieldsProps } from "@anvilkit/core";
import { useMsg } from "@anvilkit/core/i18n";
import { Input, Label, Textarea } from "@anvilkit/ui";
import type { ReactElement } from "react";

/**
 * SEO field group for the `layer` module's page-settings dialog (M4).
 *
 * Unlike {@link PageSeoPanel} — which edits the *active* Puck doc's
 * `root.props.seo` via `usePuck()` — this is a fully controlled component:
 * core's dialog owns the form state, the change diff, and the
 * `onUpdateSettings` submission, passing the page row's current SEO via
 * `value` and receiving each edit through `onChange`. It edits the
 * {@link StudioPageSeo} shape (`metaTitle`/`metaDescription`/`noindex`),
 * distinct from the panel's `root.props.seo` shape
 * (`title`/`description`/`noIndex`). Reuses the `pageSeo.field.*` i18n
 * labels, which already read as meta-* copy.
 *
 * UI is built from the shared `@anvilkit/ui` primitives (Input/Textarea/
 * Label) rather than hand-rolled inputs, so the field styling tracks the
 * design system the host already ships for its other plugins.
 */
export function PageSettingsSeoFields({
	value,
	onChange,
}: StudioPageSettingsSeoFieldsProps): ReactElement {
	const msg = useMsg();
	return (
		<div className="flex flex-col gap-3" data-testid="page-settings-seo-fields">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="page-settings-seo-meta-title-input">
					{msg("pageSeo.field.title")}
				</Label>
				<Input
					id="page-settings-seo-meta-title-input"
					data-testid="page-settings-seo-meta-title"
					value={value.metaTitle ?? ""}
					onChange={(e) => onChange({ ...value, metaTitle: e.target.value })}
				/>
			</div>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="page-settings-seo-meta-description-input">
					{msg("pageSeo.field.description")}
				</Label>
				<Textarea
					id="page-settings-seo-meta-description-input"
					data-testid="page-settings-seo-meta-description"
					className="min-h-14 resize-y"
					value={value.metaDescription ?? ""}
					onChange={(e) =>
						onChange({ ...value, metaDescription: e.target.value })
					}
				/>
			</div>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="page-settings-seo-og-image-input">
					{msg("pageSeo.field.ogImage")}
				</Label>
				<Input
					id="page-settings-seo-og-image-input"
					type="url"
					data-testid="page-settings-seo-og-image"
					value={value.ogImage ?? ""}
					onChange={(e) => onChange({ ...value, ogImage: e.target.value })}
				/>
			</div>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="page-settings-seo-canonical-input">
					{msg("pageSeo.field.canonical")}
				</Label>
				<Input
					id="page-settings-seo-canonical-input"
					type="url"
					data-testid="page-settings-seo-canonical"
					value={value.canonical ?? ""}
					onChange={(e) => onChange({ ...value, canonical: e.target.value })}
				/>
			</div>
			<Label className="flex items-center gap-2 font-normal">
				{/* @anvilkit/ui has no Checkbox primitive in its barrel; a native
				    checkbox keeps the boolean toggle dependency-free. */}
				<input
					type="checkbox"
					data-testid="page-settings-seo-noindex"
					checked={value.noindex ?? false}
					onChange={(e) => onChange({ ...value, noindex: e.target.checked })}
				/>
				{msg("pageSeo.field.noIndex")}
			</Label>
		</div>
	);
}

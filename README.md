# @anvilkit/plugin-page-seo

A `<Studio>` plugin (sidebar capability) that adds a **Page SEO** rail panel for
editing a page's SEO metadata — meta title, description, OG image, canonical URL,
and `noindex` — directly on the canonical Puck `root.props.seo` (PRD 0004 F5).

```tsx
import { createPageSeoPlugin } from "@anvilkit/plugin-page-seo";

<Studio puckConfig={config} plugins={[createPageSeoPlugin()]} />;
```

- **Single source of truth.** Edits dispatch an immutable `root.props.seo` update
  (Puck `setData`), reflected in `appState.data` — the same shape the validator,
  storage gateway, and SEO render route read.
- **Localized.** All strings come from i18n message keys (`pageSeo.*`); no inline
  copy.
- **Rail seam.** Registers via the core `registerSeoPanel` seam; the panel lights
  up under the **SEO** rail tab.

Requires `@anvilkit/core` ≥ the version exposing `registerSeoPanel`.

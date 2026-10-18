# Advanced Documentation

This guide complements the [quick guide](README-EN.md) for advanced students.

## 1. Audience and Workflow

The workflow is intentionally designed for beginners without prior knowledge. `dev` and `build` use the same sources and create the same page structure. The main difference is the output format: development pages are formatted for readability, while the production build minifies HTML, CSS, and JavaScript for publication.

This means the contents of `output/` can be deployed directly to a web server or hosting platform.

## 2. Verbose Development Mode

The regular start is intentionally compact:

```bash
npm start
```

For complete build and watcher output:

```bash
npm run dev:verbose
```

After each Codespaces reopen, run the start command again.

To start only `html simple mode` separately:

```bash
npm run dev:html
```

Then open the printed preview link.

The preview runs on port 3000. The main URLs are:

- Markdown: http://localhost:3000/
- `html extended mode`: http://localhost:3000/html-extended-mode.html
- `html simple mode`: http://localhost:3000/html-simple-mode/

## 3. Watcher Behavior

- Markdown or HTML changes rebuild only the affected page.
- Template changes rebuild the complete site.
- Changes to JavaScript, images, or static files rebuild the site.
- Regular styles and `html simple mode` styles are processed by separate Tailwind watchers.
- A CSS change triggers a full site rebuild only when the generated CSS output changes.

In compact mode, successful changes are reported as one status line:

```text
file changed (path) and page updated
file changed (path) and site updated
```

Unchanged outputs are not reported. Errors remain visible.

Markdown or HTML changes report `page updated`. Template, style, JavaScript, image, or static-file changes report `site updated`.

## 4. Production Build

```bash
npm run build
```

The build clears `output/`, recreates assets and styles, builds the `html simple mode` CSS output, and then renders all pages.

For a local preview of the production build:

```bash
npm run build-preview
```

Build and preview `html simple mode` only:

```bash
npm run build-preview:html
```

Quick commands for separate `html simple mode`:

```bash
# once
npm ci
# after each Codespaces reopen
npm run dev:html
npm run build-preview:html
```

## 5. Hashing and Caching

JavaScript, CSS, images, and files from `input/static/` receive hashed filenames when published. When the output changes, its URL changes as well, so browsers load the new file.

`input/_headers` is copied unchanged to `output/_headers`. On platforms supporting `_headers`, hashed assets can use long cache lifetimes or `immutable`. GitHub Pages does not process `_headers`.

## 6. Deployment

Always use the production build for deployment:

```bash
npm run build
```

The finished site is in `output/`. On Cloudflare Pages, use `npm run build` as the build command and `output` as the output directory.

If `output/` should not be versioned in Git, enable the corresponding lines in `.gitignore`:

```gitignore
output/
!output/.gitkeep
```

Then remove the already tracked output from Git once:

```bash
git rm -r --cached output
```

## 7. Quality Assurance

Before submission or publication:

```bash
npm run lint
npm run lint:seo
```

`npm run lint` runs JavaScript, HTML, and link checks. The link check automatically starts a local server on port 4000.

For Lighthouse, build the production version first and open it on port 4000 with `npm run preview`.

Before deployment, check `shouldIndex: true` for public pages. `robots.txt` alone does not override an active `noindex`. Lighthouse target scores are at least 90 for Performance, Accessibility, Best Practices, and SEO.

## 8. Troubleshooting

- If port 3000 or 4000 is already in use, stop the running process or choose a free port.
- If the preview does not respond, restart `npm start` and reopen the printed link.
- If a watcher does not react, run `npm ci` first and restart the appropriate dev command.

## 9. Project Files and Plugins

- Files from `input/static/` and optimized images are published with hashed filenames.
- `input/_headers` is copied to `output/_headers`; `robots.txt`, `sitemap.xml`, and `site.webmanifest` are copied to the `output/` root.
- Before deployment, adjust the domain, sitemap URL, `shouldIndex`, manifest, and `_headers` rules for the project where needed.
- The Markdown plugins in use are defined in `package.json` and the lockfile.

## 10. Directory Boundaries

- Sources are in `input/`.
- Templates are in `templates/`.
- Build and watcher logic is in `build/`.
- Lint configuration is in `lint/`.
- Published files are in `output/`.

After changing build or watcher logic, run at least `npm run lint`.

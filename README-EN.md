# Quick Start

[Deutsch](README-DE.md)

## 1. Create a GitHub Account

1. Create an account at https://github.com.
2. Confirm your email address.
3. Continue with the provided Classroom link.

## 2. Open the Starter Repository

1. Start with the provided GitHub Classroom link.
2. Let GitHub create your personal repository.
3. Open the repository in GitHub Codespaces.

## 3. Install Dependencies

In the Codespaces terminal:

Important: usually required only once (run again only if dependencies changed or `node_modules` was removed).

```bash
npm ci
```

## 4. Modes

- Without prior knowledge: `md` for content in `input/**/*.md`.
- `html extended mode`: HTML instead of Markdown in `input/**/*.html`, with all full-build features (for example image handling and asset processing).
- `html simple mode`: Tailwind CLI only with `input/html-simple-mode/input.css`.

## 5. Which Mode When?

- `md`: Default for students without prior knowledge.
- `html extended mode`: When you want to use HTML instead of Markdown while keeping all build features.
- `html simple mode`: When you want to use Tailwind CLI only.

## 6. Start the Website and Open Preview

For all modes:

```bash
npm start
```

Preview: http://localhost:3000

The development server runs on port 3000 and serves all generated pages. Add the path for the mode you want to open:

- Markdown: http://localhost:3000/
- HTML page: http://localhost:3000/html-extended-mode.html
- `html simple mode`: http://localhost:3000/html-simple-mode/

## 7. Edit Content

- Markdown and HTML content is in `input/`.
- Images are in `input/img/`; JPG/PNG files are automatically converted into multiple sizes and WEBP.
- A custom figure plugin converts single-image paragraphs into `<figure>`; captions can be added.
- There is also small custom Markdown, for example `@youtube` paragraphs.
- Templates are in `templates/`.

## 8. Save Changes and Store Them on GitHub

1. Make your changes in Codespaces.
2. Check modified files in the Source Control panel.
3. Enter a commit message.
4. Commit and push together via the Codespaces UI.

After pushing, the changes are stored in your GitHub repository.

## Quick Commands

Standard setup:

```bash
# once
npm ci
# after each Codespaces reopen
npm start
```

Further technical information for advanced students:

[Advanced documentation](README-ADVANCED-EN.md)

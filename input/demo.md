---
title: "Markdown Demo Page"
shouldIndex: false
header: true
footer: true
---

:::::: text { .prose .text-current .prose-headings:font-bold .prose-img:rounded-lg .marker:text-current .max-w-none .p-4 }

# Page Title

==***Use this page to see which code produces which output.
source code: `/input/demo.md`***==
{ .text-2xl }

`#` (heading level 1) should only be used once
[use `{ .text-2xl .font-semibold }` or similar for styling of other occurrences]{ .text-2xl .font-semibold }
[font size](https://tailwindcss.com/docs/font-size)
[font weight](https://tailwindcss.com/docs/font-weight)

# Heading 1
## Heading 2
### Heading 3

*italic*
**bold**
***italic and bold***
~~strikethrough~~

- unordered list
- unordered list
	- unordered list
	- unordered list

1. ordered list
2. ordered list
	1. ordered list
	2. also possible

::: text { .prose-li:my-0 .my-12 }
1. ordered list (less vertical space between list items)
2. ordered list (less vertical space between list items)
:::

---

[internal link](/other-page/){#weiter-unten}

[internal link (button)](/other-page/){ .rounded-full .px-4 .py-2 .border .border-red-500 .hover:bg-red-50 .no-underline }

[Markdown Cheatsheet](https://www.markdownguide.org/cheat-sheet/)

Only use this on private pages, as spambots can read the email address too: nobody@nodomain.com

## Images { #img }

### Single Image

![alternative text (description of image if it is not displayed or cannot be seen by user)](/img/hochhaus-hslu-informatik.jpg "***[Only use images you have permission to use, e.g. your own images or search for “public domain images”.<br>Nur Bilder mit entsprechenden Nutzungsrechten verwenden, z. B. eigene Bilder oder nach «gemeinfreie Bilder / Public Domain» suchen.]{ .text-orange-600 }***"){ .max-w-3/4 .max-h-[75svh] }

::: object { .text-center }
![alternative text (description of image if it is not displayed or cannot be seen by user)](https://picsum.photos/id/1/600/400 "caption"){ .max-w-2/3 .mx-auto }
:::

### Interactive Overlay Image

::: object { .not-prose .relative .group .inline-block tabindex="0" .max-w-3/4 .w-fit .mx-auto .my-8 }

![alternative text (description of image if it is not displayed or cannot be seen by user)](/img/hochhaus-hslu-informatik.jpg){ .block .rounded-lg .max-h-[75svh] .group-hover:grayscale .group-hover:blur-xs .group-focus-within:grayscale .group-focus-within:blur-xs }

!!! html
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 absolute top-2 left-2 z-10 text-white pointer-events-none group-hover:opacity-0 group-focus-within:opacity-0">
  <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
!!!

:::: text { .absolute .inset-0 .opacity-0 .flex .items-center .justify-center .text-2xl .font-semibold .text-center .text-white .wrap-break-word .rounded-lg .[text-shadow:2px_2px_1px_rgb(0,0,0)] .group-hover:opacity-100 .group-focus-within:opacity-100 }
short overlay text
::::

:::

### Masonry Columns

::: object { .my-8 .md:columns-2 .xl:columns-3 .gap-8 .*:mt-0 .*:mb-4 .*:last:mb-0 .*:break-inside-avoid-column .*:w-full }
![alternative text if image not visible (description of image)](https://placehold.co/400x300?text=image+1 "mit oder ohne Bildunterschrift")
![alternative text if image not visible (description of image)](https://placehold.co/400x400?text=image+2)
![alternative text if image not visible (description of image)](https://placehold.co/800x400?text=image+3)
![alternative text if image not visible (description of image)](https://placehold.co/400x400?text=image+4)
![alternative text if image not visible (description of image)](https://placehold.co/200x400?text=image+5)
:::

---

### Responsive Grid

::: object { .my-8 .grid .gap-x-4 .gap-y-8 .md:grid-cols-2 .xl:grid-cols-3 .place-items-center .*:my-0 .*:w-full }
![alternative text if image not visible (description of image)](https://placehold.co/400x300?text=image+1 "mit oder ohne Bildunterschrift")
![alternative text if image not visible (description of image)](https://placehold.co/400x400?text=image+2)
![alternative text if image not visible (description of image)](https://placehold.co/800x400?text=image+3)
![alternative text if image not visible (description of image)](https://placehold.co/400x400?text=image+4)
![alternative text if image not visible (description of image)](https://placehold.co/200x400?text=image+5)
:::

---

### Slideshow

[documentation slideshow library](https://splidejs.com/)

!!! html
<div class="splide" role="group" aria-label="Image Slider" tabindex="0">
	<div class="splide__track">
		<ul class="splide__list">
			<li class="splide__slide">
				<img src="https://picsum.photos/id/1/300/400" alt="alternative text if image not visible (description of image)">
				<div class="overlay">with or without caption</div>
			</li>
			<li class="splide__slide">
				<img src="https://picsum.photos/id/2/600/400" alt="alternative text if image not visible (description of image)">
			</li>
			<li class="splide__slide">
				<img src="https://picsum.photos/id/3/800/400" alt="alternative text if image not visible (description of image)">
			</li>
		</ul>
	</div>
</div>
!!!

### Horizontal Scroll Gallery

::: object { .my-8 .flex .flex-col .lg:flex-row .gap-x-8 .max-lg:*:w-full .max-lg:*:h-auto .lg:*:h-[75svh] .lg:*:w-auto .lg:overflow-x-auto }
![alternative text if image not visible (description of image)](https://placehold.co/400x300?text=image+1 "mit oder ohne Bildunterschrift")
![alternative text if image not visible (description of image)](https://placehold.co/400x400?text=image+2)
![alternative text if image not visible (description of image)](https://placehold.co/800x400?text=image+3)
![alternative text if image not visible (description of image)](https://placehold.co/400x400?text=image+4)
![alternative text if image not visible (description of image)](https://placehold.co/200x400?text=image+5)
:::

## Video { #video }

@youtube { id=Q6FvLAMFtus caption="example YouTube" }

!!! html
<div class="video">
<video src="/static/video-local.mp4" controls poster="/static/video-preview.png"></video>
<div class="caption">example video uploaded directly</div>
</div>
!!!

## Miscellaneous

[custom background color]{ .bg-mycolor .p-2 }
	// see `--color-mycolor` in /input/style/tailwind.css

custom background color (differently implemented, see source code)
{ .bg-mycolor .p-2 .w-fit }

custom background color (differently implemented, see source code)
{ .text-cyan-800 .bg-cyan-50 .px-4 .py-2 .inline-block }
	// tailwind colors: https://tailwindcss.com/docs/colors

[external form](https://e0j3mcuv.forms.app/feedback){ .block .my-8 }

## Tables

::: object { .max-w-3/4 }

| First name | Last name |     Role |
| :--------- | :-------: | -------: |
| Lea        |   Meyer   |   Design |
| Ben        |  Keller   | Frontend |
| Sara       |  Fischer  |  Content |

:::

[Markdown Table Builder](https://www.tablesgenerator.com/markdown_tables)

## PDF

[link to PDF such as your CV](/static/pdf-sample-file.pdf)

## Forms

::: fields
@first_name@ type="text" autocomplete="given-name" required
First name

@last_name@ type="text" autocomplete="family-name" required
Last name

@email@ type="email" autocomplete="email" placeholder="Please check for typos" required
Email

@message@ type="textarea" required
Message

@send@ type="submit"
Send
:::

[Netlify Forms – Setup](https://docs.netlify.com/manage/forms/setup/#automatic-form-detection)

[Netlify Forms – Notifications](https://docs.netlify.com/manage/forms/setup/#set-up-notifications)

::::::

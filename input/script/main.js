// slideshow

import Splide from "@splidejs/splide"
import "@splidejs/splide/css"

function initSplide() {
	const splides = document.querySelectorAll(".splide")

	if (splides.length) {
		splides.forEach(el => {
			const isCardCarousel = el.classList.contains("card-carousel")
			const slideCount = el.querySelectorAll(".splide__slide").length
			const splide = new Splide(el, {
				type: isCardCarousel ? "slide" : "loop",
				keyboard: true,
				gap: isCardCarousel ? "1.5rem" : "2rem",
				perPage: isCardCarousel ? Math.min(3, slideCount) : 1,
				autoplay: !isCardCarousel,
				interval: 5000,
				pauseOnHover: true,
				pauseOnFocus: true,
				pagination: !isCardCarousel,
				breakpoints: isCardCarousel
					? {
						900: { perPage: Math.min(2, slideCount) },
						640: { perPage: 1 },
					}
					: {},
				reducedMotion: {
					autoplay: false,
					speed: 0,
				},
			})

			splide.mount()

		})
	}
}

initSplide()



// toggle nav menu

const btn = document.getElementById('menu-btn')
const menu = document.getElementById('menu')

if (btn && menu) {
	btn.addEventListener('click', () => {
		const isExpanded = btn.getAttribute('aria-expanded') === 'true'

		btn.setAttribute('aria-expanded', String(!isExpanded))
		btn.setAttribute(
			'aria-label',
			isExpanded ? btn.dataset.labelOpen : btn.dataset.labelClose,
		)
		menu.classList.toggle('hidden', isExpanded)
	})

	menu.querySelectorAll('a[href^="#"]').forEach(link => {
		link.addEventListener('click', () => {
			btn.setAttribute('aria-expanded', 'false')
			btn.setAttribute('aria-label', btn.dataset.labelOpen)
			menu.classList.add('hidden')
		})
	})

	document.addEventListener('click', event => {
		if (!menu.contains(event.target) && !btn.contains(event.target)) {
			btn.setAttribute('aria-expanded', 'false')
			btn.setAttribute('aria-label', btn.dataset.labelOpen)
			menu.classList.add('hidden')
		}
	})

	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') {
			btn.setAttribute('aria-expanded', 'false')
			btn.setAttribute('aria-label', btn.dataset.labelOpen)
			menu.classList.add('hidden')
			btn.focus()
		}
	})
}

const lightbox = document.getElementById('gallery-lightbox')
const lightboxImage = document.getElementById('gallery-lightbox-image')
const lightboxClose = document.getElementById('gallery-lightbox-close')

if (lightbox && lightboxImage && lightboxClose) {
	document.querySelectorAll('.gallery-trigger').forEach(trigger => {
		trigger.addEventListener('click', () => {
			const image = trigger.querySelector('img')

			if (!image) {
				throw new Error('Gallery trigger must contain an image')
			}

			lightboxImage.src = image.currentSrc || image.src
			lightboxImage.alt = image.alt
			lightbox.showModal()
		})
	})

	lightboxClose.addEventListener('click', () => lightbox.close())
	lightbox.addEventListener('click', event => {
		if (event.target === lightbox) lightbox.close()
	})
}
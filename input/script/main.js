// slideshow

import Splide from "@splidejs/splide"
import "@splidejs/splide/css"

function initSplide() {
	const splides = document.querySelectorAll(".splide")

	if (splides.length) {
		splides.forEach(el => {
			const splide = new Splide(el, {
				type: "slide",
				rewind: true,
				keyboard: true,
				gap: "2rem",
			})

			splide.mount()

		})
	}
}

initSplide()



// toggle nav menu

const btn = document.getElementById('menu-btn')
const menu = document.getElementById('menu')

btn.addEventListener('click', () => {
	menu.classList.toggle('hidden')
})
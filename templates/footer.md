<footer class="bg-[#582f1a] px-6 py-10 text-white md:px-12">
	<div class="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2">
		<div>
			<a href="{% if lang == 'en' %}/en/{% else %}/{% endif %}" class="inline-flex items-center gap-3 font-semibold">
				<img src="/img/Logo.png" alt="" class="h-10 w-auto rounded bg-white p-1">
				<span>FEMgineers HSLU</span>
			</a>
			<p class="mt-3 max-w-md text-sm text-white/80">
				{% if lang == "en" %}
					A community for students who explore technology, share ideas and shape the future together.
				{% else %}
					Eine Gemeinschaft für Studentinnen, die Technik entdecken, Ideen teilen und gemeinsam Zukunft gestalten.
				{% endif %}
			</p>
		</div>
		<div class="sm:text-right">
			<p class="font-semibold">{% if lang == "en" %}Get in touch{% else %}Kontakt{% endif %}</p>
			<a class="mt-2 inline-block text-sm text-white/90 underline underline-offset-4 hover:text-white" href="mailto:femgineers@hslu.ch">femgineers@hslu.ch</a>
			<div class="mt-2">
				<a class="text-sm text-white/90 underline underline-offset-4 hover:text-white" href="https://www.instagram.com/femgineers.luzern/" target="_blank" rel="noopener noreferrer">@femgineers.luzern</a>
			</div>
		</div>
	</div>
	<div class="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-white/20 pt-4 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
		<p>© 2025 FEMgineers HSLU</p>
		<p>{% if lang == "en" %}Made with curiosity at Lucerne University of Applied Sciences and Arts.{% else %}Mit Neugier an der Hochschule Luzern gestaltet.{% endif %}</p>
	</div>
</footer>

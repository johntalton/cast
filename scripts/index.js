import { Vector2D } from './lib/maths.js'

function initCanvas(canvas, world, camera) {
	const worker = new Worker('./scripts/worker.js', { type: 'module' })

	worker.onerror = error => console.warn('worker error', error)

	worker.onmessage = message => {
		const { data } = message
		console.log('message from worker', data)
	}

	canvas.addEventListener('click', event => {
		const { offsetX, offsetY } = event
		const canvasX = Vector2D.mapRange(offsetX, 0, canvas.clientWidth, 0, canvas.width)
		const canvasY = Vector2D.mapRange(offsetY, 0, canvas.clientHeight, 0, canvas.height)

		worker.postMessage({
			type: 'trace',
			x: canvasX,
			y: canvasY
		})
	})

	const offscreenCanvas = canvas.transferControlToOffscreen()

	worker.postMessage({
		type: 'cast',
		canvas: offscreenCanvas,
		world,
		camera,
		// height: canvas.height,
		// width: canvas.width,
	}, {
		transfer: [ offscreenCanvas ]
	})
}

function loadWorld(worldSrc) {
	return fetch(worldSrc, { mode: 'cors' })
		.then(response => response.json())
		.then(async world => {
			const mainElem = document.querySelector('main[data-multi]')
			if(mainElem === null) { throw new Error('missing main') }
			const existing = mainElem.querySelectorAll('main > section')
			existing.forEach(s => s.remove())

			const viewTemplate = document.getElementById('ViewTemplate')
			if((viewTemplate === null) || !(viewTemplate instanceof HTMLTemplateElement)) { throw new Error('invalid template for view section') }

			world.views?.forEach(view => {
				const clone = viewTemplate.content.cloneNode(true)
				if(!(clone instanceof DocumentFragment)) { throw new Error('clone is not fragment') }
				const sectionElem = clone.querySelector('section')
				if(sectionElem === null) { throw new Error('missing section in template') }
				const output = sectionElem.querySelector('output')
				const canvas = sectionElem.querySelector('canvas')

				if(canvas === null) { throw new Error('missing canvas') }
				if(!(canvas instanceof HTMLCanvasElement)) { throw new Error('canvas not a Canvas') }

				if(output === null) { throw new Error('missing output') }
				output.value = view.name ?? ''

				mainElem?.append(sectionElem)

				initCanvas(canvas, world, view)
			})
		})
		.catch(e => {
			console.warn(e)
		})
}

function onContentLoaded() {
	const reloadButton = document.querySelector('button[command="--reload"]')

	if(typeof CommandEvent !== 'undefined') {
		reloadButton?.addEventListener('command', event => {
			const { command } = event
			if(command === '--reload') {
				reload()
			}

			console.log('command?', command)
		})
	}
	else {
		reloadButton?.addEventListener('click', event => {
			console.log('reload', event)
			reload()
		})
	}

	const worldSelect = document.getElementById('WorldSelect')
	if(worldSelect === null) { throw new Error('missing world selector') }
	if(!(worldSelect instanceof HTMLSelectElement)) { throw new Error('invalid select element') }

	worldSelect?.addEventListener('change', event => {
		reload()
	})

	const reload = () => {
		const [ option ] = worldSelect.selectedOptions
		return loadWorld(option.value)
	}

	reload()
}

(document.readyState === 'loading') ?
	document.addEventListener('DOMContentLoaded', onContentLoaded) :
	onContentLoaded()



function initCanvas(canvas, context, world, camera) {
	const worker = new Worker('./scripts/worker.js', { type: 'module' })

	worker.onmessage = message => {
		const { data } = message
		const { x, y, color } = data
		// console.log(data)
		context.fillStyle = color
		context.fillRect(x, y, 1, 1)
	}

	// canvas.addEventListener('click', event => {
	// 	const { offsetX, offsetY } = event
	// 	// console.log(event)
	// 	const canvasX = Vector2D.mapRange(offsetX, 0, canvas.clientWidth, 0, canvas.width)
	// 	const canvasY = Vector2D.mapRange(offsetY, 0, canvas.clientHeight, 0, canvas.height)

	// 	const { viewportOrigin, viewportFocus } = canvasToCameraViewport(camera, canvasX, canvasY, canvas.width, canvas.height, true)
	// 	// console.log({ canvasX, canvasY, offsetX, offsetY }, p)
	// 	const r = new Ray3D(viewportOrigin, Direction3D.from(viewportOrigin, viewportFocus))

	// 	const color = trace(world, r, true)
	// 	console.log(color)
	// })

	// cast(world, canvas.width, canvas.height, camera, worker)

	worker.postMessage({
		type: 'cast',
		world,
		camera,
		height: canvas.height,
		width: canvas.width,
	})
}


function loadWorld(worldSrc) {
	return fetch(worldSrc, { mode: 'cors' })
		.then(response => response.json())
		.then(async world => {
			const mainElem = document.querySelector('main[data-multi]')

			const existing = mainElem.querySelectorAll('main > section')
			existing.forEach(s => s.remove())

			const viewTemplate = document.getElementById('ViewTemplate')
			if((viewTemplate === null) || !(viewTemplate instanceof HTMLTemplateElement)) { throw new Error('invalid template for view section') }

			world.views?.forEach(view => {
				const clone = viewTemplate.content.cloneNode(true)
				const sectionElem = clone.querySelector('section')
				const output = sectionElem.querySelector('output')
				const canvas = sectionElem.querySelector('canvas')

				if(canvas === null) { throw new Error('missing canvas') }
				if(!(canvas instanceof HTMLCanvasElement)) { throw new Error('canvas not a Canvas') }

				const context = canvas.getContext('2d', {
					alpha: true,
					colorSpace: 'display-p3'
				})

				if(context === null) { throw new Error('failed to create canvas context') }

				output.value = view.name ?? ''

				mainElem?.append(sectionElem)

				initCanvas(canvas, context, world, view)

				return clone
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


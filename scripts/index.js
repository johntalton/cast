
import { Direction3D, Matrix3x3, Ray3D, Vector2D, Vector3D } from './cast.js'
import { trace } from './trace.js'
import { OBJECTS } from './objects.js'
import { DEFAULT_MAPPER, MAPPERS } from './mapper.js'

function cast(world, width, height, camera, port) {
	for(let h = 0; h < height; h += 1) {
		for(let w = 0; w < width; w += 1) {
			const { viewportOrigin, viewportFocus } = canvasToCameraViewport(camera, w, h, width, height)
			const r = new Ray3D(viewportOrigin, Direction3D.from(viewportOrigin, viewportFocus))
			const color = trace(world, r, false)

			port.postMessage({
				x: w, y: h, color
			})
		}
	}
}

function canvasToCameraViewport(camera, canvasX, canvasY, canvasWidth, canvasHeight, debug) {
	const _debug = (...args) => { if(debug) { console.log(...args) } }

	const viewportWidthDiv2 = camera.viewportWidth / 2
	const viewportHeightDiv2 = camera.viewportHeight / 2
	const viewportOffsetX = Vector2D.mapRange(canvasX, 0, canvasWidth, -viewportWidthDiv2, viewportWidthDiv2)
	const viewportOffsetY = Vector2D.mapRange(canvasY, 0, canvasHeight, viewportHeightDiv2, -viewportHeightDiv2)

	// const horizonRight = Vector3D.crossProduct(camera.direction, camera.normal)

	// const toViewportCenter = new Ray3D(camera.origin, camera.direction)
	// const viewportCenter = toViewportCenter.at(camera.viewportDistance)

	// const xR = new Ray3D(viewportCenter, horizonRight)
	// const viewportX = xR.at(viewportOffsetX)
	// const yR = new Ray3D(viewportX, camera.normal)
	// const viewportOrigin = yR.at(viewportOffsetY)

	// const focusR = new Ray3D(camera.origin, Direction3D.from(camera.origin, viewportOrigin))
	// const viewportFocus = focusR.at(camera.focalDistance)

	const fovRadian = (camera.fov / 2) * (Math.PI / 180)
  const eyeDistance = (1 / Math.tan(fovRadian)) * viewportWidthDiv2

  const fromEye = new Ray3D(camera.origin, camera.direction)
  const eye = fromEye.at(-eyeDistance)

	const crossAxis = Vector3D.crossProduct(camera.normal, camera.direction)
	const crossR = new Ray3D(camera.origin, crossAxis)
	const viewportX = crossR.at(viewportOffsetX)
	const normalR = new Ray3D(viewportX, camera.normal)
	const viewportOrigin = normalR.at(viewportOffsetY)

	const focusR = new Ray3D(viewportOrigin, Direction3D.from(eye, viewportOrigin))
	const viewportFocus = focusR.at(camera.focalDistance)

	_debug({
		canvasX, canvasY,
		viewportOffsetX, viewportOffsetY,
		// fromEyeOrigin: fromEye.origin,
		// fromEyeDirection: `${fromEye.direction}`,
		// fovRadian,
		// eyeDistance,
		// eye,
		// crossAxis,
		// viewportX,
		viewportOrigin,
		viewportFocus
	})

	return { viewportOrigin, viewportFocus }
}

function initCanvas(canvas, context, world, camera) {
	const { port1, port2 } = new MessageChannel()

	port2.start()
	port2.addEventListener('message', message => {
		const { data } = message
		const { x, y, color } = data
		// console.log(data)
		context.fillStyle = color
		context.fillRect(x, y, 1, 1)
	})

	canvas.addEventListener('click', event => {
		const { offsetX, offsetY } = event
		// console.log(event)
		const canvasX = Vector2D.mapRange(offsetX, 0, canvas.clientWidth, 0, canvas.width)
		const canvasY = Vector2D.mapRange(offsetY, 0, canvas.clientHeight, 0, canvas.height)

		const { viewportOrigin, viewportFocus } = canvasToCameraViewport(camera, canvasX, canvasY, canvas.width, canvas.height, true)
		// console.log({ canvasX, canvasY, offsetX, offsetY }, p)
		const r = new Ray3D(viewportOrigin, Direction3D.from(viewportOrigin, viewportFocus))

		const color = trace(world, r, true)
		console.log(color)
	})

	cast(world, canvas.width, canvas.height, camera, port1)
}


async function futureObject(options) {
	const maker = OBJECTS[(options.type ?? 'sphere').toLowerCase()]
	const mapperType = options.material?.type ?? DEFAULT_MAPPER
	const mapperMaker = MAPPERS[mapperType.toLowerCase()]

	if(maker === undefined) { throw new Error(`unknown maker`) }
	if(mapperMaker === undefined) { throw new Error(`unknown mapper ${mapperType}`) }

	const objects = options.objects ? await Promise.all(options.objects?.map(futureObject)) : undefined

	return new maker({
		...options,
		material: {
			...options.material,
			mapper: await Promise.try(mapperMaker, options.material)
		},
		objects
	})
}

function lookAt(view) {
	const { origin, lookAt: at, normal: overrideNormal, direction: overrideDirection } = view

	if(overrideNormal !== undefined && overrideDirection !== undefined) {
		return {
			direction: new Direction3D(overrideDirection),
			normal: new Direction3D(overrideNormal)
		}
	}

	const initialDirection = new Direction3D({ x: 0, y: 0, z: 1 })
	const initialNormal = new Direction3D({ x: 0, y: 1, z: 0 })

	const direction = Direction3D.from(origin, at)

	const rotation = Matrix3x3.alignment(initialDirection, direction)
	const normal = Vector3D.normalized(Matrix3x3.multiply(rotation, initialNormal))

	return { direction, normal }
}

async function futureWorld(options) {
	return {
		views: options.views.map(view => {
			const { direction, normal } = lookAt(view)
			return {
				...view,
				direction,
				normal
			}
		}),
		lights: options.lights,
		objects: await Promise.all(options.objects.map(futureObject))
	}
}

function loadWorld(worldSrc) {
	return fetch(worldSrc, { mode: 'cors' })
		.then(response => response.json())
		.then(futureWorld)
		.then(world => {
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


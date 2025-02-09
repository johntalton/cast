
import { Direction3D, Ray3D, Vector2D, Vector3D } from './cast.js'
import { trace } from './trace.js'
import { WORLD } from './world.js'

function cast(width, height, camera, port) {
	for(let w = 0; w < width; w += 1) {
		for(let h = 0; h < height; h += 1) {

			const { viewportOrigin, viewportFocus } = canvasToCameraViewport(camera, w, h, width, height)
			const r = new Ray3D(viewportOrigin, Direction3D.from(viewportOrigin, viewportFocus))
			const color = trace(WORLD, r, false)

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

function canvasContext(name) {
	const canvas = document.getElementById(name)
	if(canvas === null) { throw new Error('missing canvas') }
	if(!(canvas instanceof HTMLCanvasElement)) { throw new Error('canvas not a Canvas') }

	const context = canvas.getContext('2d', {
		alpha: true,
		colorSpace: 'display-p3'
	})

	if(context === null) { throw new Error('failed to create canvas context') }
	return { canvas, context }
}

function initCanvas(canvas, context, camera) {
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

		const color = trace(WORLD, r, true)
		console.log(color)
	})

	cast(canvas.width, canvas.height, camera, port1)
}

function initCanvasWorld() {
	const { canvas,  context } = canvasContext('Canvas')

	const cameraWorld = {
		origin: { x: -200, y: 0, z: -350 },
		direction: new Direction3D({ x: 1, y: 0, z: 1 }),
		normal: new Direction3D({ x: 0, y: 1, z: 0 }),
		fov: 30,
		focalDistance: 1,
		viewportWidth: 200, viewportHeight: 150
	}

	initCanvas(canvas, context, cameraWorld)
}

function initCanvasTop() {
	const { canvas,  context } = canvasContext('CanvasTop')

	const cameraTop = {
		origin: { x: 0, y: 100, z: -100 },
		direction: new Direction3D({ x: 0, y: -1, z: 0 }),
		normal: new Direction3D({ x: 0, y: 0, z: 1 }),
		fov: 30,
		focalDistance: 1,
		viewportWidth: 200, viewportHeight: 150
	}

	initCanvas(canvas, context, cameraTop)
}

function initCanvasFront() {
	const { canvas,  context } = canvasContext('CanvasFront')

	const cameraFront = {
		origin: { x: 0, y: 0, z: -200 },
		direction: new Direction3D({ x: 0, y: 0, z: 1 }),
		normal: new Direction3D({ x: 0, y: 1, z: 0 }),
		fov: 30,
		focalDistance: 1,
		viewportWidth: 200, viewportHeight: 150
	}

	initCanvas(canvas, context, cameraFront)
}

function initCanvasSide() {
	const { canvas,  context } = canvasContext('CanvasSide')

	const cameraSide = {
		origin: { x: -100, y: 0, z: -100 },
		direction: new Direction3D({ x: 1, y: 0, z: 0 }),
		normal: new Direction3D({ x: 0, y: 1, z: 0 }),
		fov: 30,
		focalDistance: 1,
		viewportWidth: 200, viewportHeight: 150
	}

	initCanvas(canvas, context, cameraSide)
}

function onContentLoaded() {
	initCanvasWorld()
	initCanvasTop()
	initCanvasFront()
	initCanvasSide()
}

(document.readyState === 'loading') ?
	document.addEventListener('DOMContentLoaded', onContentLoaded) :
	onContentLoaded()


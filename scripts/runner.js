import { Color } from './lib/color.js'
import { Direction3D, Ray3D, Vector2D, Vector3D, Vector3DScalar } from './lib/maths.js'
import { trace } from './lib/trace.js'

const DEPTH = 5

function canvasToCameraViewport(camera, canvasX, canvasY, canvasWidth, canvasHeight, debug) {

	const viewportWidthDiv2 = camera.viewportWidth / 2
	const viewportHeightDiv2 = camera.viewportHeight / 2
	const viewportOffsetX = Vector2D.mapRange(canvasX, 0, canvasWidth, -viewportWidthDiv2, viewportWidthDiv2)
	const viewportOffsetY = Vector2D.mapRange(canvasY, 0, canvasHeight, viewportHeightDiv2, -viewportHeightDiv2)

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

	if(debug) {
		console.log({
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
	}

	return { viewportOrigin, viewportFocus }
}

export function castOne(world, width, height, camera, x, y) {
	const { viewportOrigin, viewportFocus } = canvasToCameraViewport(camera, x, y, width, height)
	const r = new Ray3D(viewportOrigin, Direction3D.from(viewportOrigin, viewportFocus))

	const depth = DEPTH
	return trace(world, r, 'EYE', depth, true)
}

export function* cast(world, width, height, camera, minW, maxW, minH, maxH) {
	// const start = performance.now()
	const depth = DEPTH

	const offsets = Array.from({ length: 0 }, () => Vector3DScalar.multiply(Direction3D.random(), 5))

	for(let h = minH; h < maxH; h += 1) {
		for(let w = minW; w < maxW; w += 1) {
			const { viewportOrigin, viewportFocus } = canvasToCameraViewport(camera, w, h, width, height)


			const colors = offsets.reduce((acc, offset) => {
				const offsetViewportOrigin = Vector3D.add(viewportOrigin, offset)
				const r = new Ray3D(offsetViewportOrigin, Direction3D.from(offsetViewportOrigin, viewportFocus))
				return [ ...acc, trace(world, r, 'EYE', depth, false) ]
			}, [ ])

			const r = new Ray3D(viewportOrigin, Direction3D.from(viewportOrigin, viewportFocus))
			const baseColor = trace(world, r, 'EYE', depth, false)

			// const color = colors.reduce((acc, color) => {
			// 	return `color-mix(in lab, ${acc}, ${color})`
			// }, baseColor)
			const color = Color.mix(baseColor, ...colors)

			yield { x: w, y: h, color }
		}
	}

	// const diff = performance.now() - start
	// console.log(`finished in ${diff} ms`)
}

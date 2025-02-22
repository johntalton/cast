import { Direction3D, Ray3D, Vector2D, Vector3D, Vector3DScalar } from './cast.js'
import { trace } from './trace.js'

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

export function cast(world, width, height, camera, port) {
	for(let h = 0; h < height; h += 1) {
		for(let w = 0; w < width; w += 1) {
			const { viewportOrigin, viewportFocus } = canvasToCameraViewport(camera, w, h, width, height)

			const offsets = Array.from({ length: 0 }, () => Vector3DScalar.multiply(Direction3D.random(), .125))
			const colors = offsets.reduce((acc, offset) => {
				const offsetViewportOrigin = Vector3D.add(viewportOrigin, offset)
				const r = new Ray3D(offsetViewportOrigin, Direction3D.from(offsetViewportOrigin, viewportFocus))
				return [ ...acc, trace(world, r, false) ]
			}, [ ])

			const r = new Ray3D(viewportOrigin, Direction3D.from(viewportOrigin, viewportFocus))
			const baseColor = trace(world, r, false)

			const color = colors.reduce((acc, color) => {
				return `color-mix(in lab, ${acc}, ${color})`
			}, baseColor)

			port.postMessage({
				x: w, y: h, color
			})
		}
	}
}

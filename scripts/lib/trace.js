import { Direction3D, Ray3D, Vector3D, Vector3DScalar } from './maths.js'
import { Shader } from './shader.js'

const STEP_OFF_NORMAL_MULTIPLIER = 0.0125

export function trace(world, ray, debug) {
	if(debug) { console.log(ray) }

	const allIntersections = world.objects.map(obj => obj.intersections(ray, debug))
		// .filter(intersection => intersection.length > 0)
		.flat(1)
		.filter(intersection => intersection.distance > 0)
		.sort((intersectionA, intersectionB) => {
			return intersectionA.distance - intersectionB.distance
		})


	if(debug) { console.log(allIntersections) }

	if(allIntersections.length > 0) {
		const [ intersection ] = allIntersections

		// if(intersection.distance > 5000) {
		// 	return 'crimson'
		// }

		const lightingInfo = world.lights.map(light => {
			const lightDirection = Direction3D.from(intersection.at, light.center)
			if(debug) { console.log({ intersection, lightDirection }) }
			const actualIntersectionPoint = intersection.at
			const stepOffIntersectionPoint = Vector3D.add(actualIntersectionPoint, Vector3DScalar.multiply(intersection.normal, STEP_OFF_NORMAL_MULTIPLIER))
			const shadowRay = new Ray3D(stepOffIntersectionPoint, lightDirection)

			const distanceToLight = Vector3D.distance(intersection.at, light.center)

			const hasShadow = world.objects.map(shadowObj => {
				// if(intersection.object === shadowObj) { return false }

				if(debug) { console.log('shadowRay', shadowRay) }

				const shadowIntersections = shadowObj.intersections(shadowRay)
					// .filter(intersection => intersection.length > 0)
					.flat(1)
					.filter(intersection => intersection.distance > 0)
					.filter(intersection => intersection.distance < distanceToLight)
					.sort((intersectionA, intersectionB) => {
						return intersectionA.distance - intersectionB.distance
					})

				if(debug) { console.log(intersection.object, shadowObj, shadowIntersections) }
				return shadowIntersections.length > 0
			})
			.reduce((acc, hit) => acc || hit, false)


			return { direction: lightDirection, inShadow: hasShadow, color: light.color }
		})

		const [ firstLightInfo ] = lightingInfo

		return Shader.phong(intersection, firstLightInfo, debug)
	}

	return 'lightblue'
}
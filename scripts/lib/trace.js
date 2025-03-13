import { Color } from './color.js'
import { Direction3D, Ray3D, Vector3D, Vector3DScalar } from './maths.js'
import { Shader } from './shader.js'

const STEP_OFF_NORMAL_MULTIPLIER = 0.0125
const STEP_OFF_REFRACTION_NORMAL_MULTIPLIER = 0.125

const FEATURES = {
	REFLECTION: true,
	REFRACTION: true
}

const skyBoxColor = Color.from('lightblue')

//const lightOffsets = Array.from({ length: 1 }, () => Vector3DScalar.multiply(Direction3D.random(), 0))


function shortestDistance(a, b) {
	return a.distance - b.distance
}

export function trace(world, ray, type, depth, debug) {
	if(debug) { console.log(depth, type, ray) }

	const allIntersections = world.objects.map(obj => obj.intersections(ray, debug))
		.flat(1)
		.filter(intersection => intersection.distance > 0)
		.sort(shortestDistance)


	if(debug) { console.log(allIntersections) }

	if(allIntersections.length > 0) {
		const [ intersection ] = allIntersections

		if(debug) { console.log(depth, type, 'intersection', intersection.at, intersection.entering) }

		const stepOffIntersectionPoint = Vector3D.add(intersection.at, Vector3DScalar.multiply(intersection.normal, STEP_OFF_NORMAL_MULTIPLIER))

		// if(intersection.distance > 5000) {
		// 	return 'crimson'
		// }

		let reflectionColor = undefined // Color.from('white')
		if(FEATURES.REFLECTION && (intersection.object.material.reflection) && depth > 0) {
			const incident = intersection.ray.direction
			const reflectionDirection = Vector3D.subtract(incident, Vector3DScalar.multiply(intersection.normal, 2 * Vector3D.dotProduct(incident, intersection.normal)))
			const reflectionRay = new Ray3D(stepOffIntersectionPoint, reflectionDirection)
			reflectionColor = trace(world, reflectionRay, 'REFLECTION', depth - 1, debug)
		}

		let refractionColor = undefined // Color.from('white')
		if(FEATURES.REFRACTION && (intersection.object.material.refraction) && depth > 0) {
			const indexOfRefraction = intersection.object.material.refraction
			const INDEX_OF_REFRACTION_FOR_AIR = 1

			const fromIndex = intersection.entering ? INDEX_OF_REFRACTION_FOR_AIR : indexOfRefraction
			const toIndex = intersection.entering ? indexOfRefraction : INDEX_OF_REFRACTION_FOR_AIR

			const refractionNormal = intersection.entering ? intersection.normal : Vector3D.negate(intersection.normal)
			const refractionDirection = Direction3D.refractionOf(intersection.ray.direction, refractionNormal, fromIndex, toIndex)
			// const refractionDirection = intersection.ray.direction

			if(refractionDirection !== undefined) {
				const stepOffDirection = intersection.entering ? Vector3D.negate(intersection.normal) : intersection.normal
				const stepOffRefractionPoint = Vector3D.add(
					intersection.at,
					Vector3DScalar.multiply(stepOffDirection, STEP_OFF_REFRACTION_NORMAL_MULTIPLIER))

				const refractionRay = new Ray3D(stepOffRefractionPoint, refractionDirection)
				refractionColor = trace(world, refractionRay, 'REFRACTION', depth - 1, debug)
			}
		}

		const lightOffsets = Array.from({ length: 1 }, () => Vector3DScalar.multiply(Direction3D.random(), 0))

		const lightingInfo = world.lights.map(light => {
			const primaryLightDirection = Direction3D.from(intersection.at, light.center)

			const shadowSet = lightOffsets.map(lightOffset => {
				const lightDirection = Direction3D.from(intersection.at, Vector3D.add(light.center, lightOffset))

				if(debug) { console.log({ depth, intersection, lightDirection }) }

				const shadowRay = new Ray3D(stepOffIntersectionPoint, lightDirection)

				const distanceToLight = Vector3D.distance(intersection.at, light.center)

				return world.objects.map(shadowObj => {
					// if(intersection.object === shadowObj) { return false }
					if(debug) { console.log('shadowRay', depth, shadowRay) }

					const shadowIntersections = shadowObj.intersections(shadowRay)
						.flat(1)
						.filter(intersection => (intersection.distance > 0) && (intersection.distance < distanceToLight))
						// .sort(shortestDistance)

					if(debug) { console.log(depth, intersection.object, shadowObj, shadowIntersections) }
					return shadowIntersections.length > 0
				})
				.reduce((acc, hit) => acc || hit, false)
			})

			const shadowPercent = shadowSet.reduce((acc, hasShadow) => acc + (hasShadow ? 1 : 0), 0) / shadowSet.length

			if(debug) { console.log('shadow percent', shadowSet, shadowPercent) }

			return {
				...light,
				direction: primaryLightDirection,
				inShadow: shadowPercent > 0,
				shadowPercent
			}
		})

		const lightColors = Color.mix(...lightingInfo.map(info => Shader.phong(intersection, info, debug)))

		const index = 0.75
		return Color.sum(
			Color.multiply(lightColors, .25),
			Color.sum(
				Color.multiply(refractionColor, index),
				Color.multiply(reflectionColor, 1 - index)))

	}

	return skyBoxColor
}
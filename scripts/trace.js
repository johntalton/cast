import { Direction3D, Ray3D, Vector3D } from './cast.js'

export function trace(world, ray, debug) {
	const _debug = (...args) => { if(debug) { console.log(...args) } }


	_debug(ray)

	const allIntersections = world.objects.map(obj => obj.intersections(ray))
		// .filter(intersection => intersection.length > 0)
		.flat(1)
		.filter(intersection => intersection.distance > 0)
		.sort((intersectionA, intersectionB) => {
			return intersectionA.distance - intersectionB.distance
		})

	_debug(allIntersections)

	if(allIntersections.length > 0) {
		const [ intersection ] = allIntersections

		if(intersection.distance > 5000) {
			return 'crimson'
		}

		const [ firstLight ] = world.lights

		const lightDirection = Direction3D.from(intersection.at, firstLight)
		_debug({ intersection, lightDirection })
		const actualIntersectionPoint = intersection.at
		const stepOffIntersectionPoint = Vector3D.add(actualIntersectionPoint, intersection.normal)
		const shadowRay = new Ray3D(stepOffIntersectionPoint, lightDirection)

		const distanceToLight = Vector3D.distance(intersection.at, firstLight)

		const hasShadow = world.objects.map(shadowObj => {
			// if(intersection.object === shadowObj) { return false }

			_debug('shadowRay', shadowRay)

			const shadowIntersections = shadowObj.intersections(shadowRay)
				// .filter(intersection => intersection.length > 0)
				.flat(1)
				.filter(intersection => intersection.distance > 0)
				.filter(intersection => intersection.distance < distanceToLight)
				.sort((intersectionA, intersectionB) => {
					return intersectionA.distance - intersectionB.distance
				})

			 _debug(intersection.object, shadowObj, shadowIntersections)
			return shadowIntersections.length > 0
		})
		.reduce((acc, hit) => acc || hit, false)


		// intersection.normal
		// intersection.color




		return hasShadow ? `color-mix(in lab, black 40%, ${intersection.color})` : intersection.color
		// return intersection.object.material.color
	}

	return 'lightblue'
}
import { Direction3D, Ray3D, Vector3D, Vector3DScalar } from './cast.js'

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

		// if(intersection.distance > 5000) {
		// 	return 'crimson'
		// }

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


		const ambient = 0.5
		const light_intensity = 20
		const diffuse = 1

		const gloss = 5
		const specular = 1
		const lightColor = 'lemonchiffon'

		const N = intersection.normal
		const L = lightDirection
		const V = Vector3D.normalized(Vector3D.negate(intersection.ray.direction))
		const I = Vector3D.negate(L)

		if(debug) { console.log(`normal ${N}`, N) }
		// if(debug) { console.log(Vector3D.dotProduct(N, V)) }
		// const facingRatio = Math.max(0, Vector3D.dotProduct(N, V))
		// if(debug) { console.log({ N, L, V, I, facingRatio} ) }
		// const color = `color(from ${intersection.color} srgb calc(r * ${facingRatio}) calc(g * ${facingRatio}) calc(b * ${facingRatio}))`


		const albedo = .18
		const x = (albedo / Math.PI) * light_intensity * Math.max(0, Vector3D.dotProduct(N, L))
		if(debug) { console.log({ x } ) }
		const color = `color(from ${intersection.color} srgb calc(r * ${x}) calc(g * ${x}) calc(b * ${x}))`



		// lambertian Ld = Kd (I/r2) max(0, n.l)

		// const div = 2 * Vector3D.dotProduct(N, L)
		// const R = Vector3D.normalized(Vector3D.add(N, Vector3DScalar.divide(I, div)))

		// const d = diffuse * (Vector3D.dotProduct(N, L) * light_intensity)

    // const angle = Vector3D.dotProduct(V, R)
		// const s = (angle > 0.0) ? (specular * Math.pow(angle, gloss)) : 0

		// if(debug) { console.log({ N, L, V, I, angle} ) }

		// const calcR = `calc((${ambient} * r) + (${d} * r))`
		// const calcG = `calc((${ambient} * g) + (${d} * g))`
		// const calcB = `calc(((${ambient} * b) + ${d} * b))`
		// const _color = `color(from ${intersection.color} srgb ${calcR} ${calcG} ${calcB})`
		// const _light = `color(from ${lightColor} srgb calc(${s} * r) calc(${s} * g) calc(${s} * b))`
		// const color = `color-mix(in lab, ${_color}, ${_light})`

		return hasShadow ? `color-mix(in lab, black 20%, ${color})` : color
	}

	return 'lightblue'
}
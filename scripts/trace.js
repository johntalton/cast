import { Direction3D, Ray3D, Vector3D, Vector3DScalar } from './cast.js'

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
		const hasShadow = firstLightInfo.inShadow

		const ambient = 1
		const light_intensity = 1.5
		const diffuse = .5

		const gloss = 100
		const specular = 5
		const lightColor = firstLightInfo.color

		const N = intersection.normal
		const L = firstLightInfo.direction
		const V = Vector3D.normalized(Vector3D.negate(intersection.ray.direction))
		const I = Vector3D.negate(L)

		// {
		// if(debug) { console.log(`normal ${N}`, N) }
		// if(debug) { console.log('N dot V', Vector3D.dotProduct(N, V)) }
		// const facingRatio = !hasShadow ? Math.max(0, Vector3D.dotProduct(N, V)) : 0
		// if(debug) { console.log({ N, L, V, I, facingRatio} ) }
		// const color = `color(from ${intersection.color} srgb calc(r * ${facingRatio}) calc(g * ${facingRatio}) calc(b * ${facingRatio}))`
		// return hasShadow ? 'black' : color
		//}

		// {
		// const albedo = .18
		// const x = (albedo / Math.PI) * (light_intensity * 10) * Math.max(0, Vector3D.dotProduct(N, L))
		// if(debug) { console.log({ x } ) }
		// const color = `color(from ${intersection.color} srgb calc(r * ${x}) calc(g * ${x}) calc(b * ${x}))`
		// return color
		// }


		{
		const div = 2 * Vector3D.dotProduct(N, L)
		const R = Vector3D.normalized(Vector3D.add(N, Vector3DScalar.divide(I, div)))

		const d = !hasShadow ? Math.max(0, Math.min(1, (diffuse * (Vector3D.dotProduct(N, L) * light_intensity)))) : 0

    const angle = Vector3D.dotProduct(V, R)
		const s = (angle > 0 && !hasShadow) ? Math.min(1, (specular * Math.pow(angle, gloss))) : 0

		if(debug) { console.log({ N, L, V, I, angle, s, d } ) }

		const calcR = `calc((${ambient} * r) + (${d} * r))`
		const calcG = `calc((${ambient} * g) + (${d} * g))`
		const calcB = `calc((${ambient} * b) + (${d} * b))`
		const _color = `color(from ${intersection.color} srgb ${calcR} ${calcG} ${calcB})`
		const _light = `color(from ${lightColor} srgb calc(${s} * r) calc(${s} * g) calc(${s} * b))`
		const color = `color-mix(in lab, ${_color}, ${_light})`

		return hasShadow ? `color-mix(in lab, black 50%, ${color})` : color
		}


		return `rgba(calc((${N.x}) * 255) calc((${N.y}) * 255) calc((${N.z}) * 255))`
		// return  `color(from white srgb calc(${L.x} * r) calc(${L.y} * g) calc(${L.z} * b))`


	}

	return 'lightblue'
}
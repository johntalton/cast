import { Direction3D, Vector3D, Vector3DScalar } from './maths.js'

const ambient = 1

const DEFAULT_PHONG_DIFFUSE = .5
const DEFAULT_PHONG_GLOSS = 1
const DEFAULT_PHONG_SPECULAR = 0

export class Shader {
	static phong(intersection, lightInfo, debug) {
		const diffuse = intersection.object.material.diffuse ?? DEFAULT_PHONG_DIFFUSE
		const gloss = intersection.object.material.gloss ?? DEFAULT_PHONG_GLOSS
		const specular = intersection.object.material.specular ?? DEFAULT_PHONG_SPECULAR

		const N = intersection.normal
		const L = lightInfo.direction
		const V = Vector3D.negate(intersection.ray.direction)
		const I = Vector3D.negate(L)

		// const div = 2 * Vector3D.dotProduct(N, L)
		// const R = Vector3D.normalized(Vector3D.add(N, Vector3DScalar.divide(I, div)))
		 const R = Direction3D.reflectionOf(I, N)

		const hasShadow = lightInfo.inShadow
		const lightColor = lightInfo.color

		const d = Math.max(0, Math.min(1, (diffuse * (Vector3D.dotProduct(N, L) * lightInfo.intensity))))

    const angle = Vector3D.dotProduct(V, R)
		const s = (angle > 0) ? Math.min(1, (specular * Math.pow(angle, gloss))) : 0

		if(debug) { console.log({ N, L, V, I, angle, s, d } ) }

		const calcR = `calc((${ambient} * r) + (${d} * r))`
		const calcG = `calc((${ambient} * g) + (${d} * g))`
		const calcB = `calc((${ambient} * b) + (${d} * b))`
		const _color = `color(from ${intersection.color} srgb ${calcR} ${calcG} ${calcB})`
		const _light = `color(from ${lightColor} srgb calc(${s} * r) calc(${s} * g) calc(${s} * b))`
		const color = `color-mix(in lab, ${_color}, ${_light})`

		return hasShadow ? `color-mix(in lab, black ${lightInfo.shadowPercent * 50}%, ${color})` : color

	}

	static albedo(intersection, lightInfo, debug) {
		const N = intersection.normal
		const L = lightInfo.direction

		const albedo = .18


		const x = (albedo / Math.PI) * (lightInfo.intensity * 10) * Math.max(0, Vector3D.dotProduct(N, L))
		if(debug) { console.log({ x } ) }
		const color = `color(from ${intersection.color} srgb calc(r * ${x}) calc(g * ${x}) calc(b * ${x}))`
		return color
	}

	static depth(intersection, lightInfo, debug) {
		const d = intersection.distance / 1000
		return `color(from white srgb calc(${d} * r) calc(${d} * g) calc(${d} * b))`
	}

	static lighting(intersection, lightInfo, debug) {
		const L = lightInfo.direction
		return  `color(from white srgb calc(${L.x} * r) calc(${L.y} * g) calc(${L.z} * b))`
	}

	static normals(intersection, lightInfo, debug) {
		const N = intersection.normal
		 return `rgba(calc((${N.x}) * 255) calc((${N.y}) * 255) calc((${N.z}) * 255))`
	}

	static facing(intersection, lightInfo, debug) {
		const N = intersection.normal
		const L = lightInfo.direction
		const V = Vector3D.normalized(Vector3D.negate(intersection.ray.direction))
		const I = Vector3D.negate(L)

		const hasShadow = lightInfo.inShadow
		const lightColor = lightInfo.color

		if(debug) { console.log(`normal ${N}`, N) }
		if(debug) { console.log('N dot V', Vector3D.dotProduct(N, V)) }
		const facingRatio = !hasShadow ? Math.max(0, Vector3D.dotProduct(N, V)) : 0
		if(debug) { console.log({ N, L, V, I, facingRatio} ) }
		const color = `color(from ${intersection.color} srgb calc(r * ${facingRatio}) calc(g * ${facingRatio}) calc(b * ${facingRatio}))`
		return hasShadow ? 'black' : color
	}

}
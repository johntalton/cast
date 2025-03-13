/**
 * @typedef VectorLike
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

export function degreeToRadian(degree) {
	return degree * Math.PI / 180
}

export class Vector3DScalar {
	/**
	 * @param {VectorLike} v
	 * @param {number} divisor
	 * @returns {VectorLike}
	 */
	static divide(v, divisor) {
		return {
			x: v.x / divisor,
			y: v.y / divisor,
			z: v.z / divisor
		}
	}

	/**
	 * @param {VectorLike} v
	 * @param {number} multiplier
	 * @returns {VectorLike}
	 */
	static multiply(v, multiplier) {
		return {
			x: v.x * multiplier,
			y: v.y * multiplier,
			z: v.z * multiplier
		}
	}

	/**
	 * @param {VectorLike} v
	 * @returns {number}
	 */
	static magnitude(v) {
		return Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z))
	}

	/**
	 * @param {VectorLike} v
	 * @returns {number}
	 */
	static magnitudeSquared(v) {
		return (v.x * v.x) + (v.y * v.y) + (v.z * v.z)
	}
}

export class Vector3D {
	/**
	 * @param {VectorLike} v1
	 * @param {VectorLike} v2
	 * @returns {VectorLike}
	 */
	static add(v1, v2) {
		return {
			x: v1.x + v2.x,
			y: v1.y + v2.y,
			z: v1.z + v2.z
		}
	}

	/**
	 * @param {VectorLike} v1
	 * @param {VectorLike} v2
	 * @returns {VectorLike}
	 */
	static subtract(v1, v2) {
		return {
			x: v1.x - v2.x,
			y: v1.y - v2.y,
			z: v1.z - v2.z
		}
	}

	/**
	 * @param {VectorLike} v1
	 * @param {VectorLike} v2
	 * @returns {VectorLike}
	 */
	static divide(v1, v2) {
		return {
			x: v1.x / v2.x,
			y: v1.y / v2.y,
			z: v1.z / v2.z
		}
	}

	/**
	 * @param {VectorLike} v1
	 * @param {VectorLike} v2
	 * @returns {VectorLike}
	 */
	static multiply(v1, v2) {
		return {
			x: v1.x * v2.x,
			y: v1.y * v2.y,
			z: v1.z * v2.z
		}
	}

	/**
	 * @param {VectorLike} v
	 * @returns {VectorLike}
	 */
	static negate(v) {
		return {
			x: -v.x,
			y: -v.y,
			z: -v.z
		}
	}

	/**
	 * @param {VectorLike} v
	 * @returns {VectorLike}
	 */
	static invert(v) {
		return {
			x: 1 / v.x,
			y: 1 / v.y,
			z: 1 / v.z
		}
	}

	/**
	 * @param {VectorLike} v1
	 * @param {VectorLike} v2
	 * @returns {VectorLike}
	 */
	static min(v1, v2) {
		return {
			x: Math.min(v1.x, v2.x),
			y: Math.min(v1.y, v2.y),
			z: Math.min(v1.z, v2.z)
		}
	}

	/**
	 * @param {VectorLike} v1
	 * @param {VectorLike} v2
	 * @returns {VectorLike}
	 */
	static max(v1, v2) {
		return {
			x: Math.max(v1.x, v2.x),
			y: Math.max(v1.y, v2.y),
			z: Math.max(v1.z, v2.z)
		}
	}

	/**
	 * @param {VectorLike} v
	 * @returns {VectorLike}
	 */
	static abs(v) {
		return {
			x: Math.abs(v.x),
			y: Math.abs(v.y),
			z: Math.abs(v.z)
		}
	}

	/**
	 * @param {VectorLike} v
	 * @returns {VectorLike}
	 */
	static trunc(v) {
		return {
			x: Math.trunc(v.x),
			y: Math.trunc(v.y),
			z: Math.trunc(v.z)
		}
	}

	/**
	 * @param {VectorLike} v1
	 * @param {VectorLike} v2
	 * @returns {number}
	 */
	static dotProduct(v1, v2) {
		return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z)
	}

	/**
	 * @param {VectorLike} v1
	 * @param {VectorLike} v2
	 * @returns {VectorLike}
	 */
	static crossProduct(v1, v2) {
		return {
			x: v1.y * v2.z - v1.z * v2.y,
			y: v1.z * v2.x - v1.x * v2.z,
			z: v1.x * v2.y - v1.y * v2.x
		}
	}

	/**
	 * @param {VectorLike} v
	 * @returns {VectorLike}
	 */
	static normalized(v) {
		const m = Vector3DScalar.magnitude(v)
		if(m === 0) { return { ...v } }
		return Vector3DScalar.divide(v, m)
	}

	/**
	 * @param {VectorLike} v1
	 * @param {VectorLike} v2
	 * @returns {number}
	 */
	static distance(v1, v2) {
    return Vector3DScalar.magnitude(Vector3D.subtract(v2, v1))
	}
}

export class Matrix3x3 {

	static identity() {
		return [
			[ 1, 0, 0 ],
			[ 0, 1, 0 ],
			[ 0, 0, 1 ]
		]
	}

	static alignment(v1, target) {
		// https://gist.github.com/kevinmoran/b45980723e53edeb8a5a43c49f134724
		const axis = Vector3D.crossProduct(target, v1) // swapped
		const cosA = Vector3D.dotProduct(v1, target)
		const k = 1 / (1 + cosA)

		return [
			[(axis.x * axis.x * k) + cosA, (axis.y * axis.x * k) - axis.z, (axis.z * axis.x * k) + axis.y],
			[(axis.x * axis.y * k) + axis.z, (axis.y * axis.y * k) + cosA, (axis.z * axis.y * k) - axis.x],
			[(axis.x * axis.z * k) - axis.y, (axis.y * axis.z * k) + axis.x, (axis.z * axis.z * k) + cosA],
		]
	}

	static alignmentSlow(v1, target) {
		const axis = Vector3D.normalized(Vector3D.crossProduct(target, v1)) // swapped
		const dot = Vector3D.dotProduct(v1, target) // clamp?
		const angleRadians = Math.acos(dot)
		return Matrix3x3.rotateAroundAxis(axis, angleRadians)
	}


	static rotateAroundAxis(axis, radians) {
		const sinA = Math.sin(radians)
		const cosA = Math.cos(radians)
		const oneMinusCosA = 1 - cosA

		return [
			[
				(axis.x * axis.x * oneMinusCosA) + cosA,
				(axis.y * axis.x * oneMinusCosA) - (sinA * axis.z),
				(axis.z * axis.x * oneMinusCosA) + (sinA * axis.y),
			],
			[
				(axis.x * axis.y * oneMinusCosA) + (sinA * axis.z),
				(axis.y * axis.y * oneMinusCosA) + cosA,
				(axis.z * axis.y * oneMinusCosA) - (sinA * axis.x),

			],
			[
				(axis.x * axis.z * oneMinusCosA) - (sinA * axis.y),
				(axis.y * axis.z * oneMinusCosA) + (sinA * axis.x),
				(axis.z * axis.z * oneMinusCosA) + cosA
			]
		]
	}

	static rotateX(angle) {
		const sinA = Math.sin(angle)
		const cosA = Math.cos(angle)
		return [
			[ 1,    0,     0 ],
			[ 0, cosA, -sinA ],
			[ 0, sinA,  cosA ]
		]
	}

	static rotateY(angle) {
		const sinA = Math.sin(angle)
		const cosA = Math.cos(angle)
		return [
			[  cosA, 0, sinA ],
			[  0,    1,    0 ],
			[ -sinA, 0, cosA ]
		]
	}

	static rotateZ(angle) {
		const sinA = Math.sin(angle)
		const cosA = Math.cos(angle)
		return [
			[ cosA, -sinA, 0 ],
			[ sinA,  cosA, 0 ],
			[ 0,        0, 1 ]
		]
	}

	static multiply(matrix, v) {
		return {
			x: v.x * matrix[0][0] + v.y * matrix[1][0] + v.z * matrix[2][0],
			y: v.x * matrix[0][1] + v.y * matrix[1][1] + v.z * matrix[2][1],
			z: v.x * matrix[0][2] + v.y * matrix[1][2] + v.z * matrix[2][2],
		}
	}

	static multiplyMatrix(a, b) {
		const Ar0 = a[0]
		const Ar1 = a[1]
		const Ar2 = a[2]
		const Bc0 = [ b[0][0], b[1][0], b[2][0] ]
		const Bc1 = [ b[0][1], b[1][1], b[2][1] ]
		const Bc2 = [ b[0][2], b[1][2], b[2][2] ]

		const dot = (r, c) => (r[0] * c[0]) + (r[1] * c[1]) + (r[2] * c[2])

		return [
			[ dot(Ar0, Bc0), dot(Ar0, Bc1), dot(Ar0, Bc2) ],
			[ dot(Ar1, Bc0), dot(Ar1, Bc1), dot(Ar1, Bc2) ],
			[ dot(Ar2, Bc0), dot(Ar2, Bc1), dot(Ar2, Bc2) ]
		]
	}
}

export class Direction3D {
	#vector

	static random() {
		return new Direction3D({
			x: Math.random(),
			y: Math.random(),
			z: Math.random()
		})
	}

	static lookAt(view) {
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

		if(overrideNormal !== undefined) {
			return {
				direction,
				normal: new Direction3D(overrideNormal)
			}
		}

		const rotation = Matrix3x3.alignment(initialDirection, direction)
		const normal = Vector3D.normalized(Matrix3x3.multiply(rotation, initialNormal))


		return { direction, normal }
	}

	static refractionOf(incident, normal, fromIndexOf, toIndexOf) {
		const ratio = fromIndexOf / toIndexOf

		const cosTheta = -Vector3D.dotProduct(incident, normal)
		const determinate = (ratio * ratio) * (1.0 - cosTheta * cosTheta)
		if(determinate < 0) {
			// total internal refraction
			return undefined
		}

		return new Direction3D(Vector3D.add(
			Vector3DScalar.multiply(incident, ratio),
			Vector3DScalar.multiply(normal, (ratio * cosTheta) - Math.sqrt(1.0 - determinate))
		))
	}

	static reflectionOf(incident, normal) {
		return new Direction3D(Vector3D.subtract(incident, Vector3DScalar.multiply(normal, 2 * Vector3D.dotProduct(incident, normal))))
	}

	static from(p1, p2) {
		return new Direction3D(Vector3D.subtract(p2, p1))
	}

	constructor(v) {
		this.#vector = Vector3D.normalized(v)
	}

	get x() { return this.#vector.x }
	get y() { return this.#vector.y }
	get z() { return this.#vector.z }

	toString() { return `{ x: ${this.x}, y: ${this.y}, z: ${this.z} }` }
}


export class Ray3D {
	#origin
	#direction

	constructor(origin, direction) {
		this.#origin = origin
		this.#direction = direction
	}

	get origin() { return this.#origin }
	get direction() { return this.#direction }

	at(time) {
		return Vector3D.add(this.#origin, Vector3DScalar.multiply(this.#direction, time))
	}
}

let id = 0

export class Intersection3D {
	#ray
	#distance
	#object
	#entering
	#invert

	#cache = {}

	constructor(ray, distance, object, entering, invert = false) {
		this.id = id += 1

		this.#ray = ray
		this.#distance = distance
		this.#object = object
		this.#entering = entering
		this.#invert = invert
	}

	// static invert(intersection) {
	// 	const i = new Intersection3D(
	// 		intersection.#ray,
	// 		intersection.#distance,
	// 		intersection.#object,
	// 		intersection.#entering
	// 	)
	// 	i.#invert = true

	// 	return i
	// }

	get ray() { return this.#ray }
	get distance() { return this.#distance }
	get object() { return this.#object }
	get entering() {
		// if(this.#invert) { return !this.#entering }
		return this.#entering
	}

	get at() {
		if(this.#cache.at === undefined) {
			this.#cache.at = this.#ray.at(this.distance)
		}
		return this.#cache.at
	}

	get color() {
		if(this.#cache.color === undefined) {
			this.#cache.color = this.#object.colorAt(this.at)
		}
		return this.#cache.color
	}

	get normal() {
		if(this.#cache.normal === undefined) {
			const n = this.#object.normalAt(this.at)
			this.#cache.normal = this.#invert ? Vector3D.negate(n) : n
		}
		return this.#cache.normal
	}

	// toString() {}
}

export class Vector2D {
	static lerp(delta, start, end) {
		return (delta * (end - start)) + start
	}

	static mapRange(value, sourceStart, sourceEnd, destinationStart, destinationEnd) {
		const delta = (value - sourceStart) / (sourceEnd - sourceStart)
		return Vector2D.lerp(delta, destinationStart, destinationEnd)
	}

	static distance(from, to) {
		return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2))
	}
}
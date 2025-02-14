
export class Vector3DScalar {
	static divide(v, divisor) {
		return {
			x: v.x / divisor,
			y: v.y / divisor,
			z: v.z / divisor
		}
	}

	static multiply(v, multiplier) {
		return {
			x: v.x * multiplier,
			y: v.y * multiplier,
			z: v.z * multiplier
		}
	}

	static magnitude(v) {
		return Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z))
	}

	static magnitudeSquared(v) {
		return (v.x * v.x) + (v.y * v.y) + (v.z * v.z)
	}
}

export class Vector3D {
	static add(v1, v2) {
		return {
			x: v1.x + v2.x,
			y: v1.y + v2.y,
			z: v1.z + v2.z
		}
	}

	static subtract(v1, v2) {
		return {
			x: v1.x - v2.x,
			y: v1.y - v2.y,
			z: v1.z - v2.z
		}
	}

	static divide(v1, v2) {
		return {
			x: v1.x / v2.x,
			y: v1.y / v2.y,
			z: v1.z / v2.z
		}
	}

	static multiply(v1, v2) {
		return {
			x: v1.x * v2.x,
			y: v1.y * v2.y,
			z: v1.z * v2.z
		}
	}

	static negate(v) {
		return {
			x: -v.x,
			y: -v.y,
			z: -v.z
		}
	}

	static invert(v) {
		return {
			x: 1 / v.x,
			y: 1 / v.y,
			z: 1 / v.z
		}
	}

	static min(v1, v2) {
		return {
			x: Math.min(v1.x, v2.x),
			y: Math.min(v1.y, v2.y),
			z: Math.min(v1.z, v2.z)
		}
	}

	static max(v1, v2) {
		return {
			x: Math.max(v1.x, v2.x),
			y: Math.max(v1.y, v2.y),
			z: Math.max(v1.z, v2.z)
		}
	}

	static abs(v) {
		return {
			x: Math.abs(v.x),
			y: Math.abs(v.y),
			z: Math.abs(v.z)
		}
	}

	static trunc(v) {
		return {
			x: Math.trunc(v.x),
			y: Math.trunc(v.y),
			z: Math.trunc(v.z)
		}
	}

	static dotProduct(v1, v2) {
		return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z)
	}

	static crossProduct(v1, v2) {
		return {
			x: v1.y * v2.z - v1.z * v2.y,
			y: v1.z * v2.x - v1.x * v2.z,
			z: v1.x * v2.y - v1.y * v2.x
		}
	}

	static normalized(v) {
		const m = Vector3DScalar.magnitude(v)
		if(m === 0) { return { ...v } }
		return Vector3DScalar.divide(v, m)
	}

	static distance(v1, v2) {
    return Vector3DScalar.magnitude(Vector3D.subtract(v2, v1))
	}
}

export class Matrix3x3 {

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
}

export class Direction3D {
	#vector

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

export class Transform3D {

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

export class Intersection3D {
	#ray
	#distance
	#object
	#entering

	constructor(ray, distance, object, entering) {
		this.#ray = ray
		this.#distance = distance
		this.#object = object
		this.#entering = entering
	}

	get ray() { return this.#ray }
	get distance() { return this.#distance }
	get object() { return this.#object }

	get at() {
		return this.#ray.at(this.distance)
	}

	get color() {
		return this.#object.colorAt(this.at)
	}

	get normal() {
		return this.#object.normalAt(this.at)
	}
}

export class Vector2D {
	static lerp(delta, start, end) {
		return (delta * (end - start)) + start
	}

	static mapRange(value, sourceStart, sourceEnd, destinationStart, destinationEnd) {
		const delta = (value - sourceStart) / (sourceEnd - sourceStart)
		return Vector2D.lerp(delta, destinationStart, destinationEnd)
	}
}
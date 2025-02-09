// roation
// [ cos(a) -sin(a) ]
// [ sin(a)  cos(a) ]

export class Vector3D {
	static magnitude(v) {
		return Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z))
	}

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

	static negate(v) {
		return {
			x: -v.x,
			y: -v.y,
			z: -v.z
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
		const m = Vector3D.magnitude(v)
		if(m === 0) { return { ...v } }
		return Vector3D.divide(v, m)
	}

	static distance(v1, v2) {
    return Vector3D.magnitude(Vector3D.subtract(v2, v1))
	}
}

export class Direction3D {
	#vector

	static from(p1, p2) {
		return new Direction3D({
			x: p2.x - p1.x,
			y: p2.y - p1.y,
			z: p2.z - p1.z
		})
	}

	constructor(v) {
		this.#vector = Vector3D.normalized(v)
	}

	get x() { return this.#vector.x }
	get y() { return this.#vector.y }
	get z() { return this.#vector.z }

	toString() { return `{ x: ${this.x}, y: ${this.y}, z: ${this.z} }` }
}


// export class Point3D {
// 	x
// 	y
// 	z
// }

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
		return Vector3D.add(this.#origin, Vector3D.multiply(this.#direction, time))
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

	get distance() { return this.#distance }
	get object() { return this.#object }

	get at() {
		return this.#ray.at(this.distance)
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
import { Direction3D, Intersection3D, Matrix3x3, Ray3D, Vector3D, Vector3DScalar } from './cast.js'

export class Object3D {
	#material

	constructor({ material }) { this.#material = material ?? { color: 'red' } }

	get material() { return this.#material }
	set material(material) { this.#material = material }

	normalAt(point) {
		return new Direction3D({ x: 0, y: 0, z: 0 })
	}

	uvAt(point) {
		return { u: point.x, v: point.y }
	}

	colorAt(point) {
		const UV = this.uvAt(point)

		const mapper = this.material.mapper
		if(mapper) { return mapper(UV) }
		return this.material.color
	}

	intersection(ray) { return [] }
}

export class Plane extends Object3D {
	#center
	#normal

	constructor(options) {
		super(options)

		const { center, normal } = options

		this.#center = center
		this.#normal = new Direction3D(normal)
	}

	normalAt(point) {
		return this.#normal
	}

	uvAt(point) {
		const normalPoint = Vector3D.subtract(point, this.#center)
		const rotation = Matrix3x3.alignment(this.normalAt(point), new Direction3D({ x: 0, y: 0, z: -1 }))
		const { x: u, y: v } = Matrix3x3.multiply(rotation, normalPoint)
		return { u, v }
	}

	intersections(ray) {
		const denominator = Vector3D.dotProduct(this.#normal, ray.direction)
		if (Math.abs(denominator) < 0.0001) { return [] }

		const diff = Vector3D.subtract(this.#center, ray.origin)
		const t = Vector3D.dotProduct(diff, this.#normal) / denominator

		return [new Intersection3D(ray, t, this, false)]
	}
}

export class Sphere extends Object3D {
	#center
	#radius

	constructor(options) {
		super(options)

		const { center, radius, material } = options

		this.#center = center
		this.#radius = radius
	}

	normalAt(point) {
		return Direction3D.from(this.#center, point)
	}

	uvAt(point) {
		const p = Vector3D.normalized(Vector3D.subtract(point, this.#center))

		// unwrap Y axis
		// https://en.wikipedia.org/wiki/UV_mapping
		const u = 0.5 + Math.atan2(p.z, p.x) / (2 * Math.PI)
		const v = 0.5 - Math.asin(p.y) / Math.PI

		// unwrap Z axis
		// const u = (Math.atan2(d.y, d.x) + Math.PI) / 2 * Math.PI
		// const v = (Math.asin(d.z) + Math.PI / 2) / Math.PI

		return { u, v, normal: true }
	}

	intersections(ray) {
		const L = Vector3D.subtract(ray.origin, this.#center)
		const a = Vector3D.dotProduct(ray.direction, ray.direction)
		const b = 2 * Vector3D.dotProduct(L, ray.direction)
		const c = Vector3D.dotProduct(L, L) - (this.#radius * this.#radius)

		// quadratic
		const discriminate = (b * b) - (4.0 * a * c)
		if (discriminate < 0) { return [] }

		if (discriminate === 0) {
			const t = -b / (2 * a)
			return [new Intersection3D(ray, t, this, false)]
		}

		const t1 = (-b + Math.sqrt(discriminate)) / (2 * a)
		const t2 = (-b - Math.sqrt(discriminate)) / (2 * a)

		// console.log(t1, t2)

		return [
			new Intersection3D(ray, t1, this, false),
			new Intersection3D(ray, t2, this, false)
		]
	}
}

export class Cube extends Object3D {
	#center
	#width
	#height
	#depth

	#min
	#max

	constructor(options) {
		super(options)

		const { center, width, height, depth } = options

		this.#center = center
		this.#width = width
		this.#height = height
		this.#depth = depth

		const dim = {
			x: width / 2,
			y: height / 2,
			z: depth / 2
		}
		this.#min = Vector3D.subtract(center, dim)
		this.#max = Vector3D.add(center, dim)
	}

	uvAt(point) {
		const normalPoint = Vector3D.subtract(point, this.#center)
		const rotation = Matrix3x3.alignment(this.normalAt(point), new Direction3D({ x: 0, y: 0, z: -1 }))
		const { x: u, y: v } = Matrix3x3.multiply(rotation, normalPoint)
		return { u, v }
	}

	normalAt(point) {
		const p = Vector3D.subtract(point, this.#center)
		const d = Vector3DScalar.divide(Vector3D.subtract(this.#min, this.#max), 2)
		const n = Vector3D.trunc(Vector3DScalar.multiply(Vector3D.divide(p, Vector3D.abs(d)), 1.0001))

		return new Direction3D(n)
	}

	intersections(ray) {
		const inv = Vector3D.invert(ray.direction)
		const min = Vector3D.multiply(Vector3D.subtract(this.#min, ray.origin), inv)
		const max = Vector3D.multiply(Vector3D.subtract(this.#max, ray.origin), inv)

		const minT = Vector3D.min(min, max)
		const maxT = Vector3D.max(min, max)

		const near = Math.max(minT.x, minT.y, minT.z)
		const far = Math.min(maxT.x, maxT.y, maxT.z)

		// if(!Number.isFinite(near)) { return [] }
		// if(!Number.isFinite(far)) { return [] }
		if (near > far) { return [] }

		return [
			new Intersection3D(ray, near, this, false),
			new Intersection3D(ray, far, this, false),
		]
	}
}

export const OBJECTS = {
	'plane': Plane,
	'sphere': Sphere,
	'cube': Cube
}

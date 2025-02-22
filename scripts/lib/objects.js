import { Direction3D, Intersection3D, Matrix3x3, Ray3D, Vector3D, Vector3DScalar } from './maths.js'

export class Object3D {
	#name
	#material

	constructor(options) {
		const { name, material } = options
		this.#name = name
		this.#material = material ?? { color: 'red' }
	}

	get name() { return this.#name }
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

	/**
	 * @param {Ray3D} ray
	 * @returns {Array<Intersection3D>}
	 */
	intersections(ray) { return [ ] }
}

export class QuadraticObject3D extends Object3D {
	constructor(options) {
		super(options)
	}

	quadratic(ray, debug) {
		return { a: 0, b: 0, c: 0 }
	}

	intersections(ray, debug) {
		const { a, b, c } = this.quadratic(ray, debug)

		// quadratic
		const discriminate = (b * b) - (4.0 * a * c)
		if (discriminate < 0) { return [] }

		if (discriminate === 0) {
			const t = -b / (2 * a)
			return [new Intersection3D(ray, t, this, false)]
		}

		const sqrtDiscriminate = Math.sqrt(discriminate)

		const t1 = (-b - sqrtDiscriminate) / (2.0 * a)
		const t2 = (-b + sqrtDiscriminate) / (2.0 * a)

		// console.log(t1, t2)
		const enterFirst = t1 < t2

		return [
			new Intersection3D(ray, t1, this, enterFirst),
			new Intersection3D(ray, t2, this, !enterFirst)
		]
	}
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

		return [ new Intersection3D(ray, t, this, true) ]
	}
}

export class Sphere extends QuadraticObject3D {
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

		return { u, v, normalU: true, normalV: true }
	}

	quadratic(ray) {
		const L = Vector3D.subtract(ray.origin, this.#center)
		const a = Vector3D.dotProduct(ray.direction, ray.direction)
		const b = 2 * Vector3D.dotProduct(L, ray.direction)
		const c = Vector3D.dotProduct(L, L) - (this.#radius * this.#radius)

		return { a, b, c }
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
			new Intersection3D(ray, near, this, true),
			new Intersection3D(ray, far, this, false),
		]
	}
}

export class Cylinder extends QuadraticObject3D {
	#center
	#radius

	constructor(options) {
		super(options)

		const { center, radius } = options

		this.#center = center
		this.#radius = radius
	}

	uvAt(point) {
		const offset = 0 //Math.PI

		const po = Vector3D.subtract(point, this.#center)
		const p = new Direction3D({ x: po.x, y: po.y, z: 0 })
		const angle = Math.acos(Vector3D.dotProduct(p, { x: 0, y: -1, z: 0}))
		return {
			u: Math.cos(angle + offset) * 2 * this.#radius,
			v: point.z,
			normalU: true,
			normalV: false
		}
	}

	normalAt(point) {
		const po = Vector3D.subtract(point, this.#center)
		const p = new Direction3D({ x: po.x, y: po.y, z: 0 })
		const angle = Math.acos(Vector3D.dotProduct(p, { x: 0, y: -1, z: 0}))
		const d = {
			x: Math.cos(angle),
			y: Math.sin(angle),
			z: 0
		}

		return new Direction3D(d)
	}

	quadratic(ray) {
		// x^2 + y^2 = r^2
		const C = Vector3D.subtract(ray.origin, this.#center)

		const a = ray.direction.x * ray.direction.x + ray.direction.y * ray.direction.y
		const b = (2 * C.x * ray.direction.x) + (2 * C.y * ray.direction.y)
		const c = (C.x * C.x) + (C.y * C.y) - (this.#radius * this.#radius)



		return { a, b, c }
	}
}

export class Cone extends QuadraticObject3D {
	static DEFAULT_ANGLE = Math.PI / 4

	#center
	#orientation
	#angle

	constructor(options) {
		super(options)

		this.#center = options.center
		this.#orientation = new Direction3D(options.orientation ?? { x: 0, y: 1, z: 0 })
		this.#angle = options.angle ?? Cone.DEFAULT_ANGLE
	}

	uvAt(point) {
		return super.uvAt(point)
	}

	normalAt(point) {
		const d = Vector3D.distance(point, this.#center)
		const halfAngle = this.#angle / 2

		const h = d / Math.cos(halfAngle)
		const r = new Ray3D(this.#center, this.#orientation)
		const from = r.at(h)

		return Direction3D.from(from, point)
	}

	quadratic(ray, debug) {
		// https://lousodrome.net/blog/light/2017/01/03/intersection-of-a-ray-and-a-cone/
		const DdotV = Vector3D.dotProduct(ray.direction, this.#orientation)
		const halfAngle = this.#angle / 2.0
		const cosSqrAngle = Math.pow(Math.cos(halfAngle), 2)
		const CO = Vector3D.subtract(ray.origin, this.#center)
		const COdotV = Vector3D.dotProduct(CO, this.#orientation)
		const COdotCO = Vector3D.dotProduct(CO, CO)

		const a = Math.pow(DdotV, 2) - cosSqrAngle
		const b = 2 * (DdotV * COdotV - Vector3D.dotProduct(ray.direction, CO) * cosSqrAngle)
		const c = Math.pow(COdotV, 2) - COdotCO * cosSqrAngle

		// if(debug) { console.log({ a, b, c }) }

		return { a, b, c }
	}

	intersections(ray, debug) {
		return super.intersections(ray, debug)
			.filter(intersection => {
				const pc = Direction3D.from(this.#center, intersection.at)
				const angle = Vector3D.dotProduct(this.#orientation, pc)

				if(debug) { console.log({
					d: intersection.distance,
					at: intersection.at,
					pc,
					angle }) }
				return angle > 0
			})
	}
}

export class CSG extends Object3D {
	static UNION = 'UNION'
	static INTERSECTION = 'INTERSECTION'
	static DIFFERENCE = 'DIFFERENCE'

	#center
	#objects
	#operation

	constructor(options) {
		super(options)

		this.#center = options.center
		this.#operation = options.operation ?? CSG.UNION
		this.#objects = options.objects ?? []
	}

	normalAt(point) {
		return this.#objects[0].normalAt(point)
	}

	static merge(object, left, right, operation, debug) {
		function union(enteringL, enteringR) { return enteringL || enteringR }
		function intersection(enteringL, enteringR) { return enteringL && enteringR }
		function difference(enteringL, enteringR) { return enteringL && !enteringR }
		function error() { throw new Error('unknown op') }

		const op = (operation.toUpperCase() === CSG.UNION) ? union :
			(operation.toUpperCase() === CSG.INTERSECTION) ? intersection :
			(operation.toUpperCase() === CSG.DIFFERENCE) ? difference :
			error

		const lastL = { value: false }
		const lastR = { value: false }

		const L = left
			.map(intersection => ({ intersection, last: lastL, other: lastR, left: true }))
		const R = right
			.map(intersection => ({ intersection, last: lastR, other: lastL, left: false }))


		const result = [ ...L, ...R ]
			.sort((a, b) => a.intersection.distance - b.intersection.distance)
			.reduce((acc, item) => {

				const left = item.left ? item.intersection.entering : item.other.value
				const right = item.left ? item.other.value : item.intersection.entering

				const e = op(left, right)
				const drop = acc.previous === e
				item.last.value = item.intersection.entering

				if(debug) {
					console.log({
						o: item.intersection.object,
						e: item.intersection.entering,
						d: item.intersection.distance,
						// last: item.last.value,
						r: e,
						drop,
						ll: lastL.value,
						lr: lastR.value
					})
				}

				if(drop) { return acc }
				//if(drop) { return { ...acc, previous: e } }

				return {
					previous: e,
					result: [ ...acc.result, new Intersection3D(
						item.intersection.ray,
						item.intersection.distance,
						object,
						e) ]
				}
			}, {
				previous: false,
				result: []
			})

		return result.result
	}

	intersections(ray, debug) {
		const left = this.#objects[0].intersections(ray)
		const right = this.#objects[1].intersections(ray)

		return CSG.merge(this, left, right, this.#operation, debug)
	}
}

export const OBJECTS = {
	'plane': Plane,
	'sphere': Sphere,
	'cube': Cube,
	'cylinder': Cylinder,
	'cone': Cone,
	'csg': CSG
}

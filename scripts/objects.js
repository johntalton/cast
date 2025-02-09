import { Intersection3D, Vector3D } from './cast.js'

export class Plane {
  #center
  #normal
  #material

  constructor(center, normal) {
    this.#center = center
    this.#normal = normal
    this.#material = 'red'
  }

  get material() { return this.#material }
  set material(material) { this.#material = material }

  intersections(ray) {
    const denominator = Vector3D.dotProduct(this.#normal, ray.direction)
    if(Math.abs(denominator) < 0.0001) { return [] }

    const diff = Vector3D.subtract(this.#center, ray.origin)
    const t = Vector3D.dotProduct(diff, this.#normal) / denominator

    // console.log({ t })
    // if(t < 0) { return [] }
    return [ new Intersection3D(ray, t, this, false) ]
  }
}

export class Sphere {
  #center
  #radius
  #material

  constructor(center, radius) {
    this.#center = center
    this.#radius = radius
    this.#material = 'green'
  }

  get material() { return this.#material }
  set material(material) { this.#material = material }

  intersections(ray) {
    const L = Vector3D.subtract(ray.origin, this.#center)
    const a = Vector3D.dotProduct(ray.direction, ray.direction)
    const b = 2 * Vector3D.dotProduct(L, ray.direction)
    const c = Vector3D.dotProduct(L, L) - (this.#radius * this.#radius)

    // quadratic
    const discriminate = (b * b) - (4.0 * a * c)
    if(discriminate < 0) { return [] }

    if(discriminate === 0) {
      const t = -b / (2 * a)
      return [ new Intersection3D(ray, t, this, false) ]
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

export class Cube {
  #center
  #width
  #height
  #depth
  #material

  #min
  #max

  constructor(center, width, height, depth) {
    this.#center = center
    this.#width = width
    this.#height = height
    this.#depth = depth
    this.#material = 'purple'

    const dim = {
      x: width / 2,
      y: height / 2,
      z: depth / 2
    }
    this.#min = Vector3D.subtract(center, dim)
    this.#max = Vector3D.add(center, dim)
  }

  get material() { return this.#material }
  set material(material) { this.#material = material }

  intersections(ray) {
    const inv = Vector3D.invert(ray.direction)
    const min = Vector3D.multiply(Vector3D.subtract(this.#min, ray.origin), inv)
    const max = Vector3D.multiply(Vector3D.subtract(this.#max, ray.origin), inv)

    const minT = Vector3D.min(min, max)
    const maxT = Vector3D.max(min, max)

    const near = Math.max(minT.x, minT.y, minT.z)
    const far = Math.min(maxT.x, maxT.y, maxT.z)

    // console.log({ near, far })
    // if(!Number.isFinite(near)) { return [] }
    // if(!Number.isFinite(far)) { return [] }
    if(near > far) { return [] }

    return [
      new Intersection3D(ray, near, this, false),
      new Intersection3D(ray, far, this, false),
    ]
  }
}

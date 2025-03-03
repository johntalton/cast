import { Direction3D } from './maths.js'
import { OBJECTS } from './objects.js'
import { DEFAULT_MAPPER, MAPPERS } from './mapper.js'
import { Color } from './color.js'

const DEFAULT_LIGHT_INTENSITY = 1

export class World {
	static async futureMaterial(options) {

		const color = Array.isArray(options?.color) ?
			options.color.map(Color.from) :
			Color.from(options?.color)

		return {
			...options,
			color
		}
	}

	static async futureObject(options) {
		const maker = OBJECTS[(options.type ?? 'sphere').toLowerCase()]
		const mapperType = options.material?.type ?? DEFAULT_MAPPER
		const mapperMaker = MAPPERS[mapperType.toLowerCase()]

		if(maker === undefined) { throw new Error(`unknown maker`) }
		if(mapperMaker === undefined) { throw new Error(`unknown mapper ${mapperType}`) }

		const material = await World.futureMaterial(options.material)

		const withMaterial = o => ({ material: material, ...o })
		const objects = options.objects ? await Promise.all(options.objects?.map(withMaterial).map(World.futureObject)) : undefined

		return new maker({
			...options,
			// transform: {
			// 	toLocal: {}
			// },
			material: {
				...material,
				mapper: await Promise.try(mapperMaker, material)
			},
			objects
		})
	}

	static async futureView(options) {
		const { direction, normal } = Direction3D.lookAt(options)

		return {
			...options,
			direction,
			normal
		}
	}

	static async futureLights(options) {
		return {
			...options,
			color: Color.from(options.color),
			intensity: options.intensity ?? DEFAULT_LIGHT_INTENSITY
		}
	}

	static async futureWorld(options) {
		return {
			views: await Promise.all(options.views.map(World.futureView)),
			lights: await Promise.all(options.lights.map(World.futureLights)),
			objects: await Promise.all(options.objects.map(World.futureObject))
		}
	}
}


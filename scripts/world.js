import { Direction3D } from './cast.js'
import { OBJECTS } from './objects.js'
import { DEFAULT_MAPPER, MAPPERS } from './mapper.js'

export class World {
	static async futureObject(options) {
		const maker = OBJECTS[(options.type ?? 'sphere').toLowerCase()]
		const mapperType = options.material?.type ?? DEFAULT_MAPPER
		const mapperMaker = MAPPERS[mapperType.toLowerCase()]

		if(maker === undefined) { throw new Error(`unknown maker`) }
		if(mapperMaker === undefined) { throw new Error(`unknown mapper ${mapperType}`) }

		const objects = options.objects ? await Promise.all(options.objects?.map(World.futureObject)) : undefined

		return new maker({
			...options,
			material: {
				...options.material,
				mapper: await Promise.try(mapperMaker, options.material)
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

	static async futureWorld(options) {
		return {
			views: await Promise.all(options.views.map(World.futureView)),
			lights: options.lights,
			objects: await Promise.all(options.objects.map(World.futureObject))
		}
	}
}


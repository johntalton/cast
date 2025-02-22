import { cast } from './runner.js'
import { World } from './world.js'

self.onmessage = message => {
	const { data } = message
	const { world, height, width, camera } = data

	World.futureWorld(world)
		.then(async realWorld => {
			const realCamera = await World.futureView(camera)
			cast(realWorld, width, height, realCamera, self)
		})
		.catch(e => console.warn(e))
}


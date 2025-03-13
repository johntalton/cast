import { World } from './lib/world.js'
import { cast } from './runner.js'

const config = {}

function handleWorld(data) {
	const { world, camera, width, height } = data

	// console.log('handle world', world, camera)
	World.futureWorld(world)
		.then(async realWorld => {
			config.world = realWorld
			config.camera = await World.futureView(camera)
			config.height = height
			config.width = width

			requestChunk()
		})
}

function handleChunk(data) {
	const { chunk } = data

	// console.log({ chunk })

	Promise.resolve()
		.then(() => {
			const length = chunk.width * chunk.height * 4
			const imageData = new Uint8ClampedArray(length)

			for(const { x, y, color } of cast(config.world, config.width, config.height, config.camera, chunk.x, chunk.x + chunk.width, chunk.y, chunk.y + chunk.height)) {
				// console.log(chunk, x, y)
				const index = ((y - chunk.y) * chunk.width + (x - chunk.x)) * 4
				imageData[index] =  color.r
				imageData[index + 1] = color.g
				imageData[index + 2] =  color.b
				imageData[index + 3] = 255

				// imageData[index] =  Math.random() * 255
				// imageData[index + 1] = Math.random() * 255
				// imageData[index + 2] =  Math.random() * 255
				// imageData[index + 3] =  255
			}

			globalThis.postMessage({
				type: 'chunk-done',
				chunk,
				imageData
			}, { transfer: [ imageData.buffer ] })
		})
		.then(() => requestChunk())
}

function requestChunk() {
	// console.log('requestChunk')
	globalThis.postMessage({ type: 'request-chunk' })
}

globalThis.onmessage = message => {
	const { data } = message
	const { type } = data

	switch(type) {
		case 'world':
			handleWorld(data)
			break
		case 'chunk':
			handleChunk(data)
			break
		default:
			console.warn('pool-worker unknown type', type)
	}
}


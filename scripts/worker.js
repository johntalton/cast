import { cast, castOne } from './runner.js'
import { World } from './lib/world.js'

const config = {
	world: undefined,
	camera: undefined,
	width: 0,
	height: 0
}

function handleCast(data) {
	const { canvas, world, camera } = data
	// console.log('cast requested')

	const context = canvas.getContext('2d', {
		alpha: true,
		colorSpace: 'display-p3'
	})
	if(context === null) { throw new Error('failed to create canvas context') }

	const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

	World.futureWorld(world)
		.then(async realWorld => {
			config.world = realWorld
			config.width = canvas.width
			config.height = canvas.height
			config.camera = await World.futureView(camera)

			console.log(realWorld)

			for(const { x, y, color } of cast(config.world, config.width, config.height, config.camera, 0, config.width, 0, config.height)) {
				// context.fillStyle = color
				// context.fillRect(x, y, 1, 1)
				const index = (y * config.width + x) * 4
				// imageData.data[index] =  Math.random() * 255
				// imageData.data[index + 1] = Math.random() * 255
				// imageData.data[index + 2] =  Math.random() * 255
				// imageData.data[index + 3] = 255
				imageData.data[index] =  color.r
				imageData.data[index + 1] = color.g
				imageData.data[index + 2] =  color.b
				imageData.data[index + 3] = 255
			}

			context.putImageData(imageData, 0, 0)
			globalThis.postMessage({ type: 'done' })
		})
		.catch(e => console.warn(e))
}

function handleTrace(data) {
	const { x, y } = data
	const color = castOne(config.world, config.width, config.height, config.camera, x, y)
	console.log(color)
}


globalThis.onmessage = message => {
	const { data } = message
	const { type } = data

	// console.log('worker message', type)

	switch(type) {
		case 'cast':
			handleCast(data)
			break
		case 'trace':
			handleTrace(data)
			break
		default:
			console.warn('unknown message type', type)
			break
	}
}

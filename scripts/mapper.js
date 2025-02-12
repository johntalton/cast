
export function checkerMapper(options) {
	const checkerWidth = options?.width ?? 20
	const checkerHeight = options?.height ?? 20
	const [ oddColor, evenColor ] = Array.isArray(options?.color) ? options.color : [ options?.color ?? DEFAULT_COLOR, 'white' ]

	return (u, v) => {
		const normalU = Math.abs(Math.round(u / checkerWidth))
		const normalV = Math.abs(Math.round(v / checkerHeight))

		return (normalU % 2 === normalV % 2) ? oddColor : evenColor
	}
}

export async function textureMapper(options) {
	const url = options?.url ?? ''

	function makeMapperFn(imageData) {
		const { width, height, data } = imageData

		return (u, v) => {
			const _u = Math.abs(Math.round(u))
			const _v = Math.abs(Math.round(v))

			const index = 4 * ((_v * width) + _u)
			const r = data[index + 0]
			const g = data[index + 1]
			const b = data[index + 2]
			const a = data[index + 3] / 255

			return `rgb(${r} ${g} ${b})`
		}
	}

	const { resolve, reject, promise } = Promise.withResolvers()

	const image = new Image()
	image.src = url
	image.onload = event => {
		const offscreen = new OffscreenCanvas(image.naturalWidth, image.naturalHeight)
		const context = offscreen.getContext('2d', { colorSpace: 'display-p3' })
		if(context === null) {
			reject(new Error('failed to create offscreen canvas for texture'))
			return
		}
		context.drawImage(image, 0, 0)
		const data = context.getImageData(0, 0, offscreen.width, offscreen.height, { colorSpace: 'display-p3' })
		resolve(makeMapperFn(data))
	}
	image.onerror = event => reject(new Error('unable to load url'))

	return promise
}

export function colorMapper(options) {
	return () => {
		return (Array.isArray(options?.color) ? options.color[0] : options?.color) ?? DEFAULT_COLOR
	}
}

export const DEFAULT_COLOR = 'red'
export const DEFAULT_MAPPER = 'color'
export const MAPPERS = {
	'checker': checkerMapper,
	'texture': textureMapper,
	[DEFAULT_MAPPER]: colorMapper
}
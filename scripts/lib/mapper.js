import { Color } from './color.js'

export function checkerMapper(options) {
	const NORMAL_SCALE = 8
	const checkerWidth = options?.width ?? 20
	const checkerHeight = options?.height ?? 20
	const scale = options?.scale ?? NORMAL_SCALE
	const [ oddColor, evenColor ] = Array.isArray(options?.color) ? options.color : [ options?.color ?? DEFAULT_COLOR, SECOND_DEFAULT_COLOR ]

	return uv => {
		const { u, v, normalU, normalV } = uv

		const _u = normalU ? (u * checkerWidth * scale) : u
		const _v = normalV ? (v * checkerHeight * scale) : v

		const scaledU = Math.abs(Math.round(_u / checkerWidth))
		const scaledV = Math.abs(Math.round(_v / checkerHeight))

		return (scaledU % 2 === scaledV % 2) ? oddColor : evenColor
	}
}

export async function textureMapper(options) {
	const NORMAL_SCALE = 1
	const url = options?.url ?? ''
	const scale = options?.scale ?? NORMAL_SCALE

	function makeMapperFn(imageData) {
		const { width, height, data } = imageData

		return uv => {
			const { u, v, normalU = false, normalV = false } = uv

			const scaledU = normalU ? (u * width * scale) : u * scale
			const scaledV = normalV ? (v * height * scale) : v * scale

			const modU = Math.round(scaledU) % width
			const modV = Math.round(scaledV) % height

			const _u = (modU < 0) ? (width + modU) : modU
			const _v = (modV < 0) ? (height + modV) : modV


			const index = 4 * ((_v * width) + _u)
			const r = data[index + 0]
			const g = data[index + 1]
			const b = data[index + 2]
			// const a = data[index + 3]

			return { r, g, b }
		}
	}

	const _url = new URL(url, self.location.href)
	const response = await fetch(_url, { mode:'no-cors'})
	if(!response.ok) {
		// console.log(response)
		throw new Error(`failed to fetch image url ${_url}`)
	}
	const blob = await response.blob()
	const image = await createImageBitmap(blob)

	const offscreen = new OffscreenCanvas(image.width, image.height)
	const context = offscreen.getContext('2d', { colorSpace: 'display-p3' })
	if(context === null) { throw new Error('failed to create offscreen canvas for texture') }
	context.drawImage(image, 0, 0)
	image.close()
	const data = context.getImageData(0, 0, offscreen.width, offscreen.height, { colorSpace: 'display-p3' })
	return makeMapperFn(data)
}

export function colorMapper(options) {
	const color = (Array.isArray(options?.color) ? options.color[0] : options?.color) ?? DEFAULT_COLOR

	return uv => color
}

export const DEFAULT_COLOR = Color.from('red')
export const SECOND_DEFAULT_COLOR = Color.from('white')
export const DEFAULT_MAPPER = 'color'
export const MAPPERS = {
	'checker': checkerMapper,
	'texture': textureMapper,
	[DEFAULT_MAPPER]: colorMapper
}
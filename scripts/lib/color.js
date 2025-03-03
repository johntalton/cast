import { COLORS_LIST } from './colors.js'

export const COLOR_MAP = new Map()

COLORS_LIST.forEach(colorDef => {
	COLOR_MAP.set(colorDef.name, colorDef.rgb)
})

export class Color {
	static from(name) {
		if(typeof name !== 'string') { return name }
		return COLOR_MAP.get(name)
	}

	static multiply(color, factor) {
		if(color === undefined) { return color }
		return {
			r: color.r * factor,
			g: color.g * factor,
			b: color.b * factor
		}
	}

	static sum(...colors) {
		const c = colors.filter(c => c !== undefined)
		return c.reduce((acc, c) => ({
			r: acc.r + c.r,
			g: acc.g + c.g,
			b: acc.b + c.b
		}), { r: 0, g: 0, b: 0 })
	}

	static mix(...colors) {
		const c = colors.filter(c => c !== undefined)
		return Color.multiply(Color.sum(...c), 1 / c.length)
	}
}

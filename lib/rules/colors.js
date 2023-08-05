const HEX_REGEX = /^#([A-Fa-f0-9]{3}){1,2}$/
const HSL_REGEX =
  /^hsl\(\s*(\d+(\.\d+)?),\s*(\d+(\.\d+)?)%\s*,\s*(\d+(\.\d+)?)%\s*\)$/
const HSLA_REGEX =
  /^hsla\(\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?%\s*,\s*\d+(\.\d+)?%\s*,\s*[\d.]+\s*\)$/
const RGBA_REGEX = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
const RGB_REGEX = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/
const SHADE_VARIATION_PERCENTAGE = 5 // %

const COLOR_FORMAT = {
  HEX: 1,
  RGB: 2,
  RGBA: 3,
  HSL: 4,
  HSLA: 5,
}

function isValidHexCode(hex) {
  return HEX_REGEX.test(hex)
}

function isHSLColor(color) {
  return HSL_REGEX.test(color)
}

function isRGBAColor(color) {
  return RGBA_REGEX.test(color)
}

function isRGBColor(color) {
  return RGB_REGEX.test(color)
}

function isHSLAColor(color) {
  return HSLA_REGEX.test(color)
}

function hslaToColorStr({ h, s, l, a }) {
  if (a && a !== 1) {
    return `hsla(${h}deg ${s}% ${l}% / ${a}%)`
  }
  return `hsl(${h}deg ${s}% ${l}%)`
}

function getColorFormat(color) {
  if (isValidHexCode(color)) {
    return COLOR_FORMAT.HEX
  }
  if (isRGBColor(color)) {
    return COLOR_FORMAT.RGB
  }
  if (isRGBAColor(color)) {
    return COLOR_FORMAT.RGBA
  }
  if (isHSLColor(color)) {
    return COLOR_FORMAT.HSL
  }
  if (isHSLAColor(color)) {
    return COLOR_FORMAT.HSLA
  }
  return 0
}

function rawRGBToHSLA(r, g, b, a = 1) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h,
    s,
    l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic (gray)
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a,
  }
}

function hexToHSLA(hex) {
  // Convert the hexadecimal color code to RGB values
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // Normalize the RGB values
  const rNormalized = r / 255
  const gNormalized = g / 255
  const bNormalized = b / 255

  return rawRGBToHSLA(rNormalized, gNormalized, bNormalized)
}

function rgbaToHSLA(rgba) {
  const match = rgba.match(RGBA_REGEX)
  const r = parseInt(match[1], 10)
  const g = parseInt(match[2], 10)
  const b = parseInt(match[3], 10)
  const a = match[4] ? parseFloat(match[4]) : 1

  return rawRGBToHSLA(r, g, b, a * 100)
}

function rgbToHSLA(rgb) {
  const match = rgb.match(RGB_REGEX)
  const r = parseInt(match[1], 10)
  const g = parseInt(match[2], 10)
  const b = parseInt(match[3], 10)

  return rawRGBToHSLA(r, g, b)
}

function hslToHSLA(hsl) {
  const match = hsl.match(HSL_REGEX)
  return {
    h: parseInt(match[1], 10),
    s: parseInt(match[2], 10),
    l: parseInt(match[3], 10),
    a: 1,
  }
}

function hslaStrToHSLA(hsla) {
  const match = hsla.match(HSLA_REGEX)
  return {
    h: parseInt(match[1], 10),
    s: parseInt(match[2], 10),
    l: parseInt(match[3], 10),
    a: parseInt(match[4], 10),
  }
}

function normalizeColorAndGenShades(hsla) {
  const { h, s, l, a } = hsla

  const main = hsla
  const light = {
    h,
    s,
    l: Math.max(0, l - SHADE_VARIATION_PERCENTAGE),
    a,
  }
  const dark = {
    h,
    s,
    l: Math.min(100, l + SHADE_VARIATION_PERCENTAGE),
    a,
  }

  return {
    main: hslaToColorStr(main),
    light: hslaToColorStr(light),
    dark: hslaToColorStr(dark),
  }
}

function parseNormalizeShades(colors) {
  const parsedColors = {}

  Object.keys(colors).forEach(color => {
    const format = getColorFormat(colors[color])

    let parsedColor = null

    if (format === COLOR_FORMAT.HEX) {
      parsedColor = hexToHSLA(colors[color])
    } else if (format === COLOR_FORMAT.RGB) {
      parsedColor = rgbToHSLA(colors[color])
    } else if (format === COLOR_FORMAT.RGBA) {
      parsedColor = rgbaToHSLA(colors[color])
    } else if (format === COLOR_FORMAT.HSL) {
      parsedColor = hslToHSLA(colors[color])
    } else if (format === COLOR_FORMAT.HSLA) {
      parsedColor = hslaStrToHSLA(colors[color])
    }

    if (parsedColor) {
      parsedColors[color] = normalizeColorAndGenShades(parsedColor)
    }
  })

  return parsedColors
}

function colorRule(color) {
  if (color && typeof color === 'object') {
    // 1. parse
    // 2. normalize
    // 3. shades

    let lightColors = {}
    let darkColors = {}
    let hasLightColorsDefined = false
    let hasDarkColorsDefined = false

    if (color.light && typeof color.light === 'object') {
      lightColors = parseNormalizeShades(color.light)
      hasLightColorsDefined = Object.keys(lightColors).length > 0
    }

    if (color.dark && typeof color.dark === 'object') {
      darkColors = parseNormalizeShades(color.dark)
      hasLightColorsDefined = Object.keys(darkColors).length > 0
    }

    if (!hasLightColorsDefined && !hasDarkColorsDefined) {
      lightColors = parseNormalizeShades(color)
      darkColors = lightColors
    } else if (!hasLightColorsDefined) {
      lightColors = darkColors
    } else if (!hasDarkColorsDefined) {
      darkColors = lightColors
    }

    return {
      light: lightColors,
      dark: darkColors,
    }
  }

  return null
}

export default colorRule

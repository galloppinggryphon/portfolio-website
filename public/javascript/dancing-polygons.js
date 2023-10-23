/**
 * dancing-polygons.js
 * (C) Bjornar Egede-Nissen 2023
 */

/**
 * Define number of vertices and constrain vertex locations.
 *
 * Max/min vertex randomization constraints in %.
 *
 * @type {Record<string, {x: [min: number, max: number], y: [min: number, max: number]}[]>}
 */
const polygonTemplates = {
	square_1: [
		{ x: [ 0, 20 ], y: [ 0, 20 ] }, /* tl */
		{ x: [ 80, 100 ], y: [ 0, 30 ] }, /* tr */
		{ x: [ 80, 100 ], y: [ 50, 100 ] }, /* br */
		{ x: [ 10, 30 ], y: [ 60, 80 ] }, /* bl */
	],

	square_2: [
		{ x: [ 0, 20 ], y: [ 0, 20 ] }, /* tl */
		{ x: [ 80, 100 ], y: [ 0, 20 ] }, /* tr */
		{ x: [ 80, 100 ], y: [ 80, 100 ] }, /* br */
		{ x: [ 0, 20 ], y: [ 80, 100 ] }, /* bl */
	],

	five_sided_1: [
		// { x: [ 0, 30 ], y: [ 0, 20 ] }, /* tl */
		{ x: [ 30, 50 ], y: [ 0, 30 ] },
		{ x: [ 80, 100 ], y: [ 0, 40 ] }, /* tr */
		{ x: [ 80, 100 ], y: [ 40, 60 ] },
		{ x: [ 80, 100 ], y: [ 80, 100 ] }, /* br */
		{ x: [ 10, 30 ], y: [ 60, 80 ] }, /* bl */
		// { x: [ 10, 30 ], y: [ 40, 60 ] },
	],

	seven_sided_1: [
		{ x: [ 0, 30 ], y: [ 0, 20 ] }, /* tl */
		{ x: [ 30, 50 ], y: [ 0, 30 ] },
		{ x: [ 80, 100 ], y: [ 0, 40 ] }, /* tr */
		{ x: [ 80, 100 ], y: [ 40, 60 ] },
		{ x: [ 80, 100 ], y: [ 80, 100 ] }, /* br */
		{ x: [ 10, 30 ], y: [ 60, 80 ] },
		{ x: [ 10, 30 ], y: [ 40, 60 ] }, /* bl */
	],

	seven_sided_2: [
		{ x: [ 0, 30 ], y: [ 10, 40 ] }, /* tl */
		{ x: [ 30, 50 ], y: [ 20, 40 ] }, /* tc */
		{ x: [ 80, 100 ], y: [ 0, 40 ] }, /* tr */
		{ x: [ 80, 100 ], y: [ 40, 70 ] },
		{ x: [ 80, 100 ], y: [ 70, 80 ] }, /* br */
		{ x: [ 40, 60 ], y: [ 80, 100 ] }, /* bc */
		{ x: [ 0, 30 ], y: [ 60, 80 ] }, /* bl */
	],

	star_five_sided_1: [
		{ x: [ 50, 50 ], y: [ 70, 100 ] }, /* top */
		{ x: [ 100, 100 ], y: [ 50, 50 ] },
		{ x: [ 50, 50 ], y: [ 0, 30 ] },
		{ x: [ 0, 70 ], y: [ 50, 50 ] },
	],

	inverting_diamond_1: [
		{ x: [ 90, 100 ], y: [ 55, 100 ] },
	],
}

/**
 * @type {KeyframeEffectOptions}
 */
const defaultAnimationSettings = {
	iterations: Infinity,
}

/**
 * @type {Record<string,Record<string,any>|any[]>}
 */
const presets = {
	polygon: polygonTemplates,

	// Duration per step
	speed: {
		slow: 5000,
		medium: 2000,
		fast: 1000,
		superfast: 500,
	},
}

/**
 * @type {{animated?: boolean, animationEffect?: KeyframeEffectOptions, speed?: string, steps?: number, dataAttribute?: string, polygon?: keyof typeof polygonTemplates, vertices?: typeof polygonTemplates[string] }}
 */
const defaultOptions = {
	animated: true,
	animationEffect: defaultAnimationSettings,
	polygon: 'square_1',
	speed: 'medium',
	steps: 10,
	dataAttribute: 'polygon',
	vertices: undefined,
}

/**
 * @param {string} selector
 * @param {typeof defaultOptions} options
 */
export function attachDancingPolygons( selector, options ) {
	const elements = [ ...document.querySelectorAll( selector ) ]

	console.log( elements )
	elements.forEach( ( el ) => dancingPolygons( options ).attach( el ).initialize() )
}

/**
 * @param {typeof defaultOptions} options
 */
export function dancingPolygons( options = {} ) {
	/**
	 * @type {typeof defaultOptions & {elementRef: HTMLElement}}
	 */
	const data = {
		...( defaultOptions ),
		elementRef: undefined,
	}

	Object.assign( data, structuredClone( options ) )

	function createPolygon() {
		const vertices = data.vertices.map( ( vertex ) => {
			const x = randomInt( vertex.x[ 0 ], vertex.x[ 1 ] )
			const y = randomInt( vertex.y[ 0 ], vertex.y[ 1 ] )
			return `${ x }% ${ y }%`
		} )

		return `polygon(${ vertices.join( ',' ) })`
	}

	function setPolygonFromTemplate( name ) {
		const template = polygonTemplates[ name ]

		if ( ! template ) {
			throw new Error( `Polygon template not found: ${ name }` )
		}

		data.vertices = template
	}

	/**
	 * Read settings from [data-dancing-blob] attribute, if defined
	 */
	function getDataAttributeSettings() {
		const attrName = kebabToCamelCase( data.dataAttribute )
		const elementSettings = data.elementRef.dataset[ attrName ]

		if ( elementSettings ) {
			let json

			try {
				json = JSON.parse( elementSettings )
			}
			catch ( err ) {
				console.error( 'Polygon Transformer error: Invalid settings attached to selected DOM element - not valid JSON.' )
				console.log( 'Error Info\n', { element: data.elementRef, dataAttribute: data.dataAttribute, dataAttributeContent: elementSettings } )
				return
			}

			const { animated, animationEffect, steps, ...rest } = json

			! steps || ( data.steps = steps )
			! animationEffect || ( data.animationEffect = animationEffect )

			if ( animated !== undefined ) {
				data.animated = animated
				data.steps = animated ? data.steps : 0
			}

			applyPresets( rest )
		}
	}

	function applyPresets( settings ) {
		Object.entries( settings ).forEach( ( [ propName, value ] ) => {
			const propPresets = structuredClone( presets[ propName ] )

			if ( typeof value !== 'string' || ! propPresets ) {
				return
			}

			const presetValue = propPresets[ value ]
			if ( presetValue !== undefined ) {
				switch ( propName ) {
					case 'polygon':
						setPolygonFromTemplate( value )
						break

					case 'speed':
						// Calc full animation duration based on duration per step
						data.animationEffect.duration = presetValue * data.steps
						break

					default:
						data.animationEffect[ propName ] = propPresets[ value ]
				}
			}
		} )
	}

	function initialize() {
		applyPresets( data )
		getDataAttributeSettings()

		if ( ! data.animated ) {
			createStaticClipPath()
			return
		}

		const animation = Array( data.steps - 1 ).fill( null ).map( () => {
			return { clipPath: createPolygon() }
		} )

		// For smooth looping, add the first keyframe at the end
		animation.push( animation[ 0 ] )

		// console.log( data.animationEffect, animation )
		data.elementRef.animate( animation, data.animationEffect )
	}

	function createStaticClipPath () {
		data.elementRef.style.clipPath = createPolygon()
	}

	return {
		/**
		 * @param {HTMLElement} element
		 */
		attach( element ) {
			if ( ! element ) {
				console.warn( `Invalid query selector supplied to addPolygonAnimation(): element not found.` )
				return
			}

			data.elementRef = element
			return this
		},

		initialize,

		getPolygon: createPolygon,
	}

}

function randomInt( min, max ) {
	return Math.floor(
		Math.random() * ( max - min + 1 ) + min,
	)
}

function kebabToCamelCase( string ) {
	return string.replace( /-./g, ( x )=> x[ 1 ].toUpperCase() )
}

/**
 * routes.js
 * (C) Bjornar Egede-Nissen 2023
 */

var express = require( 'express' )
const path = require( 'path' )
const { config, mainMenu, routes } = require( '../appdata' )
const { asyncHandler, readJsonFile, svg } = require( '../utils' )
const router = express.Router()

routes.forEach( ( route ) => {
	if ( route.template === 'projects' ) {
		return
	}

	router.get( route.urlTemplate, asyncHandler( async function( req, res, next ) {
		// Clone the config item to avoid polluting the parent object
		const { dataSource, ...rest } = route // dataSource may contain a function; can't be cloned
		const payload = structuredClone( rest )
		payload.menu = mainMenu
		payload.page = route.template
		payload.params = {}
		payload.data = {}
		payload.path = { svg }

		// if ( config.pageData[ route.template ] ) {
		// 	payload.data = config.pageData[ route.template ]
		// }

		if ( dataSource ) {
			// dataSource may be a string or a [string, function] tuple
			const [ filename, apply ] = [ dataSource ].flat()

			const filePath = path.resolve( 'data', filename )
			const data = await readJsonFile( filePath )

			// Apply data processing function, if it's defined
			payload.data = typeof apply === 'function' ? apply( data ) : data
		}

		res.render( payload.root, payload )
	} ) )
} )

module.exports = router

/**
 * projects.js
 * (C) Bjornar Egede-Nissen 2023
 */

const express = require( 'express' )
const path = require( 'path' )
const { asyncHandler, readJsonFile } = require( '../utils' )
const { mainMenu, routes, config } = require( '../appdata' )

const router = express.Router()
const route = routes.find( ( r ) => r.template === 'projects' )

if ( route ) {
	router.get( route.urlTemplate, asyncHandler( async function( req, res, next ) {
		// Clone the config item to avoid polluting the parent object
		const { dataSource, ...rest } = route // dataSource may contain a function; can't be cloned
		const payload = structuredClone( rest )
		payload.menu = mainMenu
		payload.active = 'projects'
		payload.page = payload.templates.default
		payload.data = {}

		// Check if parameters are in the route
		// Then check if any are present in URL
		const { params } = req

		// Send whole request to template
		payload.params = params

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

		console.log( payload )

		const paramKeys = Object.keys( params )

		if ( paramKeys.length ) {
			// The first param determined the template
			// Check if it is provided
			const first = paramKeys[ 0 ]
			payload.recordName = params[ first ]

			if ( payload.recordName !== undefined ) {
				payload.page = payload.templates[ first ]
			}
		}

		if ( payload.page === 'project-item' ) {
			payload.data.item = payload.data.projects.find( ( item ) => item.name === payload.recordName )
		}

		res.render( payload.root, payload )
	} ) )
}

module.exports = router

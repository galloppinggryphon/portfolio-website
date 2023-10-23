/**
 * utils.js
 * (C) Bjornar Egede-Nissen 2023
 */
const path = require( 'path' )

const fs = require( 'fs' ).promises

function asyncHandler ( fun ) {
	return ( req, res, next ) => {
		Promise.resolve( fun( req, res, next ) )
			.catch( next )
	}
}

async function readJsonFile( filenane ) {
	try {
		const file = await fs.readFile( filenane, 'utf8' )
			.catch( console.error )

		return JSON.parse( file )
	}
	catch ( err ) {
		console.error( err )
	}
}

function svg( svgName ) {
	return path.resolve( 'assets/svg', `${ svgName }.svg` )
}

module.exports.asyncHandler = asyncHandler
module.exports.readJsonFile = readJsonFile
module.exports.svg = svg

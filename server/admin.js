/**
 * admin.js
 *
 * Scan portfolio.js, copy images to public folder and create thumbnails
 *
 * (C) Bjornar Egede-Nissen 2023
 */
const https = require( 'https' )
const path = require( 'path' )
const fs = require( 'fs' )
const Jimp = require( 'jimp' )
const { readJsonFile } = require( './utils' )
const { config } = require( './appdata' )

const targetFolder = '/images/portfolio'
const portfolioFile = path.resolve( './data', 'portfolio.json' )
const publicPath = path.resolve( './public' )
const outputFolder = path.posix.join( targetFolder, 'generated' )
const outputPath = path.join( publicPath, outputFolder )
const targetPath = path.join( publicPath, targetFolder )

let portfolioData

async function main() {
	portfolioData = await readJsonFile( portfolioFile )

	// getRemoteImages()
	// generateExtraSizes()
	resizeImages()
}

/**
 * Generate portfolio image sizes from full-sized originals.
 *
 * //@param {boolean} overwrite
 */
async function resizeImages( overwrite = false ) {
	console.log( '\n*** Generating portfolio image sizes ***\n' )

	const errors = []
	const sizes = Object.keys( config.imageSizes )

	for ( const item of portfolioData.projects ) {
		for ( const size of sizes ) {
			const result = await createImageSize( item.image.original, size )

			if ( result ) {
				item.image[ size ] = path.posix.join( outputFolder, result )
			}
			else {
				errors.push( [ item.name, size ] )
			}
		}
	}

	if ( errors.length ) {
		console.log( '\n\n\n=======================================\n' )
		console.log( 'Resize operation errors:' )
		console.log( errors )
	}
}

function generateImageSizeFilename( image, size ) {
	const filename = path.basename( image )
	const target = path.join( targetPath, filename )

	const ext = path.extname( filename )
	const name = filename.substring( 0, filename.length - ext.length )

	const generatedFilename = `${ name }(${ size })${ ext }`
	const outputFile = path.resolve( '.', outputPath, generatedFilename )

	return { filename, generatedFilename, outputFile, target }
}

/**
 * Resize image and save new copy to disk.
 *
 * @param {*} image
 * @param {*} size
 */
async function createImageSize( image, size ) {
	const { filename, generatedFilename, outputFile, target } = generateImageSizeFilename( image, size )
	const { imageSizes } = config
	console.log( `Resizing ${ filename }:`, size, imageSizes[ size ], ' ==>' )

	const result = await resizeImage( target, outputFile, imageSizes[ size ] )

	if ( ! result ) {
		console.error( '--> X FAILED! X' )
	}
	else {
		// console.info( '--> SUCCESS' )
		return generatedFilename
	}
}

const JimpResizeMethods = {
	contain: 1,
	cover: 2,
	force: 3,
}

/**
 * Resize and write image to disk.
 *
 * @param {string} input
 * @param {string} output
 * @param {[width: number, height: number, method: 'cover'|'contain'|'force']} newSize
 */
async function resizeImage( input, output, newSize ) {
	return Jimp.read( input )
		.then( ( img ) => {
			let resized
			let [ width, height, method = 'contain' ] = newSize
			let resizeMethod = JimpResizeMethods[ method ] ?? JimpResizeMethods.contain

			if ( ! width ) {
				width = Jimp.AUTO
			}
			else if ( ! height ) {
				height = Jimp.AUTO
			}

			switch ( resizeMethod ) {
				case JimpResizeMethods.contain:
					// If method == contain, need to find the longest edge of the picture
					// Set the orthogonal side to auto
					const isLandscape = img.getWidth() > img.getHeight()
					let finalWidth = isLandscape ? width : Jimp.AUTO
					let finalHeight = isLandscape ? Jimp.AUTO : height
					resized = img.resize( finalWidth, finalHeight )
					break

				case JimpResizeMethods.cover:
					resized = img.cover( width, height, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_TOP )
					break

				case JimpResizeMethods.resize:
					resized = img.resize( width, height )
					break
			}

			return resized.write( output )
		} )
		.catch( ( err ) => {
			console.error( err )
		} )
}

/**
 * Generate entries for configured image sizes in portfolio.js. Only needs to be run if settings are changed.
 */
function generateExtraSizes() {
	const errors = []
	const sizes = Object.keys( config.imageSizes )

	for ( const item of portfolioData.projects ) {
		for ( const size of sizes ) {
			const { generatedFilename } = generateImageSizeFilename( item.image.original, size )
			item.image[ size ] = path.posix.join( outputFolder, generatedFilename )
		}
	}

	writeJson( portfolioFile, portfolioData )

}

/**
 * Download remote referenced images.
 */
async function getRemoteImages() {
	for ( const item of portfolioData.projects ) {
		const { original } = item.image

		if ( original.substring( 0, 4 ) !== 'http' ){
			continue
		}

		const filename = path.basename( original )
		const target = path.join( targetPath, filename )
		await downloadFile( original, target )
		item.image.original = path.posix.join( targetFolder, filename )
	}

	writeJson( portfolioFile, portfolioData )
}

function downloadFile( url, target ) {
	const file = fs.createWriteStream( target )

	let resolve
	const result = new Promise( ( r ) => resolve = r )

	https.get( url, ( response ) => {
		response.pipe( file )

		file.on( 'finish', () => {
			file.close()
			console.log( `Image downloaded as ${ target }` )
			resolve()
		} )
	} ).on( 'error', ( err ) => {
		fs.unlink( target )
		console.error( `Error downloading image: ${ err.message }` )
	} )

	return result
}

async function writeJson( filename, data ) {
	const json = JSON.stringify( data, null, 4 )
	fs.writeFileSync( filename, json )
}

main()

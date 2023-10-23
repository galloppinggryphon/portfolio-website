/**
 * app.js
 *
 * Entry point.
 *
 * (C) Bjornar Egede-Nissen 2023
 */

const { env } = require( 'process' )
const path = require( 'path' )

const createError = require( 'http-errors' )
const express = require( 'express' )
const helmet = require( 'helmet' )
const cookieParser = require( 'cookie-parser' )
const logger = require( 'morgan' )

require( 'dotenv' ).config()

const indexRouter = require( './routes/index' )
const projectRouter = require( './routes/projects' )
const config = require( '../data/config' )

const app = express()

app.set( 'views', path.join( __dirname, 'views' ) )
app.set( 'view engine', 'ejs' )

// Disable helmet (CORS) in development
if ( env.node_env === 'production' ) {
	app.use( helmet() )
}

app.use( logger( 'dev' ) )
app.use( express.json() )
app.use( express.urlencoded( { extended: false } ) )
app.use( cookieParser() )
app.use( express.static( path.resolve( 'public' ) ) )

app.use( '/', indexRouter )
app.use( '/projects', projectRouter )

// catch 404 and forward to error handler
app.use( function( req, res, next ) {
	next( createError( 404 ) )
} )

// error handler
app.use( function( err, req, res, next ) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get( 'env' ) === 'development' ? err : {}

	// render the error page
	res.status( err.status || 500 )
	res.render( 'error' )
} )

app.listen( config.port, () => {

	console.log( `App started.` )
	console.log( 'Port:', config.port )
	console.log( 'Mode:', env.node_env )

} )

module.exports = app

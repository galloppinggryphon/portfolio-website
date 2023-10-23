/**
 * routes.js
 * (C) Bjornar Egede-Nissen 2023
 */
const routeConfig = require( './routes-config' )

const routes = routeConfig.map( ( route ) => {
	route.urlTemplate ??= route.url
	return route
} )

module.exports = routes

/**
 * appdata.js
 * (C) Bjornar Egede-Nissen 2023
 */
const config = require( '../data/config' )
const routeConfig = require( '../data/routes' )

const routes = routeConfig.map( ( route ) => {
	route.urlTemplate ??= route.url
	return route
} )

const mainMenu = generateMainMenu( routes )

function generateMainMenu( routeData ) {
	return routeData
		.filter( ( item ) => config.mainMenu.includes( item.template ) )
		.map( ( { url, template, title } ) => ( { url, title, key: template } ) )
}

module.exports.config = config
module.exports.routes = routes
module.exports.mainMenu = mainMenu

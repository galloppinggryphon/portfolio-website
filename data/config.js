/**
 * config.js
 * (C) Bjornar Egede-Nissen 2023
 */
module.exports = {
	imageSizes: {
		// Max width, max height, resize method
		'thumbnail': [ 400, 400, 'cover' ],
		'medium': [ 800, 600, 'contain' ],
		'large': [ 1200, 1200, 'contain' ],
	},
	port: 3000,
	mainMenu: [ 'home', 'projects', 'services', 'blog', 'about', 'contact' ],
}

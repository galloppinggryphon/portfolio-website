/**
 * routes.js
 * (C) Bjornar Egede-Nissen 2023
 */
const routes = [
	{
		url: '/',
		template: 'home',
		title: 'Home',
		description: 'This is the home page',
		root: 'index',
		dataSource: [
			'portfolio.json',
			( data ) => {
				// Todo: move list to a config file
				const highlights = [ 'colour-composer', 'onedrive-recovery-tool', 'engineering-tools-minecraft', 'venn-diagram-shading-tool' ]

				return {
					highlights: highlights.map( ( name ) => {
						return data.projects.find( ( item ) => item.name === name )
					} ),
				}
			},
		],
	},
	{
		url: '/projects',
		urlTemplate: '/:project?',
		template: 'projects',
		templates: {
			default: 'projects',
			project: 'project-item',
		},
		title: 'Projects',
		root: 'index',
		dataSource: 'portfolio.json',
	},
	{
		url: '/services',
		template: 'services',
		root: 'index',
		title: 'Services',
		description: 'This is the contact page',
		menu: true,
	},
	{
		url: '/blog',
		template: 'blog',
		root: 'index',
		title: 'Blog',
		description: 'This is the contact page',
		menu: true,
	},
	{
		url: '/about',
		template: 'about',
		title: 'About',
		description: 'This is the about page',
		root: 'index',
	},
	{
		url: '/contact',
		template: 'contact',
		root: 'index',
		title: 'Contact',
		description: 'This is the contact page',
		menu: true,
	},
]

module.exports = routes

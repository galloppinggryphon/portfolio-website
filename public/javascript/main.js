/**
 * main.js
 * (C) Bjornar Egede-Nissen 2023
 */
import { attachDancingPolygons } from './dancing-polygons.js'

function dancingBlobs() {
	const settings = {
		polygon: 'square_1',
		steps: 20,
		speed: 'medium',
		dataAttribute: 'dancing-blob',
	}

	attachDancingPolygons( '[data-dancing-blob]', settings )
}

document.addEventListener( 'DOMContentLoaded', () => {
	dancingBlobs()
} )

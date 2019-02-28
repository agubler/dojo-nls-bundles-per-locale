export default {
	locales: {
		fr: () => import('./fr'),
		de: () => import('./de')
	},
	messages: {
		title: 'About Page'
	}
}

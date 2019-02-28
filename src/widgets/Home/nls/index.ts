export default {
	locales: {
		fr: () => import('./fr'),
		de: () => import('./de')
	},
	messages: {
		title: 'Home Page'
	}
}

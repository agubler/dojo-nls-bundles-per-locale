export default {
	locales: {
		fr: () => import('./fr'),
		de: () => import('./de')
	},
	messages: {
		welcome: 'Welcome Page'
	}
}

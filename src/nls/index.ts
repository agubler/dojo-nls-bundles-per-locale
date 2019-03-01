export default {
	locales: {
		fr: () => import('./fr'),
		de: () => import('./de')
	},
	messages: {
		user: 'User'
	}
};

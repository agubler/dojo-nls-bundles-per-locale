export default {
	locales: {
		fr: () => import('./fr'),
		de: () => import('./de')
	},
	messages: {
		home: 'Home',
		about: 'About',
		profile: 'Profile'
	}
};

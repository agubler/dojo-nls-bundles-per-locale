import Container from '@dojo/framework/widget-core/Container';
import Menu from './Menu';

export default Container(Menu, 'locale', {
	getProperties(context) {
		return {
			localeSwitcher: context
		};
	}
});

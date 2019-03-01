import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import I18nMixin from '@dojo/framework/widget-core/mixins/I18n';
import { v, w } from '@dojo/framework/widget-core/d';
import Outlet from '@dojo/framework/routing/Outlet';

import Menu from './widgets/Menu/Menu.container';
import Home from './widgets/Home/Home';
import About from './widgets/About/About';
import Profile from './widgets/Profile/Profile';

import bundle from './nls';
import * as css from './App.m.css';

export default class App extends I18nMixin(WidgetBase) {
	protected render() {
		const { messages } = this.localizeBundle(bundle);
		return v('div', { classes: [css.root] }, [
			w(Menu, {}),
			v('div', [
				w(Outlet, { key: 'home', id: 'home', renderer: () => w(Home, {}) }),
				w(Outlet, { key: 'about', id: 'about', renderer: () => w(About, {}) }),
				w(Outlet, {
					key: 'profile',
					id: 'profile',
					renderer: () => w(Profile, { username: `Dojo ${messages.user}` })
				})
			])
		]);
	}
}

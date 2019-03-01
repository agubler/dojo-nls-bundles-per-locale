import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { v, w } from '@dojo/framework/widget-core/d';
import I18nMixin from '@dojo/framework/widget-core/mixins/I18n';
import watch from '@dojo/framework/widget-core/decorators/watch';
import Link from '@dojo/framework/routing/ActiveLink';
import Toolbar from '@dojo/widgets/toolbar';
import Select from '@dojo/widgets/select';

import * as css from './Menu.m.css';
import bundle from './nls';

interface MenuProperties {
	localeSwitcher: Function;
}

export default class Menu extends I18nMixin(WidgetBase)<MenuProperties> {
	private _locales = ['en', 'de', 'fr'];
	@watch() private _locale = 'en';
	@watch() private _collapsed = false;
	protected render() {
		const { messages } = this.localizeBundle(bundle);
		return w(
			Toolbar,
			{
				heading: 'My Dojo App!',
				collapseWidth: 650,
				onCollapse: (value: boolean) => {
					this._collapsed = value;
				}
			},
			[
				v('div', { classes: [css.container, this._collapsed ? css.columnContainer : null] }, [
					w(
						Link,
						{
							to: 'home',
							classes: [css.link],
							activeClasses: [css.selected]
						},
						[messages.home]
					),
					w(
						Link,
						{
							to: 'about',
							classes: [css.link],
							activeClasses: [css.selected]
						},
						[messages.about]
					),
					w(
						Link,
						{
							to: 'profile',
							classes: [css.link],
							activeClasses: [css.selected]
						},
						[messages.profile]
					),
					v('div', { classes: [css.selectWrapper] }, [
						w(Select, {
							extraClasses: {
								input: css.select
							},
							value: this._locale,
							options: this._locales,
							useNativeElement: true,
							getOptionValue: (option: string) => option,
							onChange: (value: string) => {
								this._locale = value;
								this.properties.localeSwitcher(value);
							}
						})
					])
				])
			]
		);
	}
}

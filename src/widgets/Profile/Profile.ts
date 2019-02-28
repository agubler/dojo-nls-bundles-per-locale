import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import I18nMixin from '@dojo/framework/widget-core/mixins/I18n';
import { v } from '@dojo/framework/widget-core/d';

import bundle from './nls';
import * as css from './Profile.m.css';

export interface ProfileProperties {
	username: string;
}

export default class Profile extends I18nMixin(WidgetBase)<ProfileProperties> {
	protected render() {
		const { username } = this.properties;
		const { messages } = this.localizeBundle(bundle);
		return v('h1', { classes: [css.root] }, [`${messages.welcome} ${username}!`]);
	}
}

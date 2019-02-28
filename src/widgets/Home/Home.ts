import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import I18nMixin from '@dojo/framework/widget-core/mixins/I18n';
import { v } from '@dojo/framework/widget-core/d';

import * as css from './Home.m.css';
import bundle from './nls';

export default class Home extends I18nMixin(WidgetBase) {
	protected render() {
		const { messages } = this.localizeBundle(bundle);
		return v('h1', { classes: [css.root] }, [messages.title]);
	}
}

import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import I18nMixin from '@dojo/framework/widget-core/mixins/I18n';
import { v } from '@dojo/framework/widget-core/d';

import bundle from './nls';
import * as css from './About.m.css';

export default class About extends I18nMixin(WidgetBase) {
	protected render() {
		const { messages } = this.localizeBundle(bundle);
		return v('h1', { classes: [css.root] }, [messages.title]);
	}
}

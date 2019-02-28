import renderer from '@dojo/framework/widget-core/vdom';
import Registry from '@dojo/framework/widget-core/Registry';
import { w } from '@dojo/framework/widget-core/d';
import { registerRouterInjector } from '@dojo/framework/routing/RouterInjector';
import { registerThemeInjector } from '@dojo/framework/widget-core/mixins/Themed';
import { registerI18nInjector } from '@dojo/framework/widget-core/mixins/I18n';
import dojo from '@dojo/themes/dojo';
import '@dojo/themes/dojo/index.css';

import routes from './routes';
import App from './App';

const registry = new Registry();
registerRouterInjector(routes, registry);
registerThemeInjector(dojo, registry);
const context = registerI18nInjector({ locale: 'en'}, registry);

const r = renderer(() => w(App, {}));
r.mount({ registry });

const locales = ['en', 'fr', 'de'];
let localIndex = 0;

// switch locale every 10 seconds
setInterval(() => {
	const newLocaleIndex = localIndex + 1;
	if (newLocaleIndex > locales.length - 1) {
		localIndex = 0;
	} else {
		localIndex = newLocaleIndex;
	}
	context.set({ locale: locales[newLocaleIndex] });
}, 10000);

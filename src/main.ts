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
const injector = registerI18nInjector({ locale: 'en' }, registry);
registry.defineInjector('locale', (invalidator) => {
	function localeSwitcher(locale: string) {
		injector.set({ locale });
	}
	return () => localeSwitcher;
});

const r = renderer(() => w(App, {}));
r.mount({ registry });

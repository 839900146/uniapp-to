// @ts-nocheck
import { App } from 'vue'
import { to } from './index'
export default {
	install(app: App) {
		if (app.config?.globalProperties) {
			app.config.globalProperties.$to = to
		} else {
			app.prototype.$to = to
		}
	},
}
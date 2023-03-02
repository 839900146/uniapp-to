import { $to, TPlugin, usePlugins } from './index'
export default (plugins?: TPlugin[]) => {

	if(Array.isArray(plugins)) {
		plugins.forEach(usePlugins)
	}
	
	return {
		install(app: any) {
			if (app.config?.globalProperties) {
				app.config.globalProperties.$to = $to
			} else {
				app.prototype.$to = $to
			}
		},
	}
}
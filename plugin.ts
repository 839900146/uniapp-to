import { TPlugin, TConfig } from "./index.d"

const plugins: TPlugin[] = []

export const usePlugins = (plugin: TPlugin) => {
    if (!plugins.includes(plugin)) plugins.push(plugin)
}

export const applyPlugins = async (config: TConfig) => {
    for (const plugin of plugins) {
        try {
            let flag = await plugin(config)
            if (flag === true) return flag
        } catch (error) {
            console.error('[uniapp-to plugin error]', error)
        }
    }
}
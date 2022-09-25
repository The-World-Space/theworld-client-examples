export class Logger {
    private _plugin: BasePlugin;

    public constructor(plugin: BasePlugin) {
        this._plugin = plugin;
    }

    public log(message: any): void {
        this._plugin.sendMessage("log", message);
    }

    public error(message: any): void {
        this._plugin.sendMessage("error", message);
    }
}

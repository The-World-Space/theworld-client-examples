export class Logger {
    private static _plugin: BasePlugin;
    
    public static init(plugin: BasePlugin): void {
        Logger._plugin = plugin;
    }

    public static log(message: any): void {
        this._plugin.sendMessage("log", message);
    }

    public static error(message: any): void {
        this._plugin.sendMessage("error", message);
    }
}

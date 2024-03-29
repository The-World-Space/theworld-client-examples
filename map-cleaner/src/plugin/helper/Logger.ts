export class Logger {
    private static _plugin: BasePlugin;
    
    public static init(plugin: BasePlugin): void {
        Logger._plugin = plugin;
    }

    public static log(message: any): void {
        Logger._plugin.broadcastMessage("log", message);
    }

    public static error(message: any): void {
        Logger._plugin.broadcastMessage("error", message);
    }
}

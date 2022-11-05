import { ServerAPI, ServerResponse } from "decky-frontend-lib";

export class PyInterop {
    private static serverAPI: ServerAPI;

    static setServer(serv: ServerAPI) {
        this.serverAPI = serv;
    }

    static get server() { return this.serverAPI; }

    static async add(left: number, right: number): Promise<ServerResponse<number>> {
        return await this.serverAPI.callPluginMethod<{ left: number, right: number }, number>("add", { left: left, right: right });
    }

    static async getInstalledFlatpaks(): Promise<ServerResponse<string[]>> {
        return await this.serverAPI.callPluginMethod<{}, string[]>("getInstalledFlatpaks", {});
    }
}
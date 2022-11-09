import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import { FlatpakInfo } from "./FlatpakInfo";

type FlatpaksDictionary = {
    [key: string]: FlatpakInfo
}


export class PyInterop {
    private static serverAPI: ServerAPI;

    static setServer(serv: ServerAPI) {
        this.serverAPI = serv;
    }

    static get server() { return this.serverAPI; }

    static async getUpdatableFlatpaks(): Promise<ServerResponse<FlatpaksDictionary>> {
        return await this.serverAPI.callPluginMethod<{}, FlatpaksDictionary>("getUpdatableFlatpaks", {});
    }
}
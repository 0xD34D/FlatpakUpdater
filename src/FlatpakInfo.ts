export class FlatpakInfo {
    appID: string;
    name: string;

    constructor(appID: string, name: string) {
        this.appID = appID;
        this.name = name;
    }

    static fromJSON(json: any) {
        return new FlatpakInfo(json.appID, json.name);
    }
}

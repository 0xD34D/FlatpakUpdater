export class FlatpakInfo {
    appID: string;
    name: string;
    hash: string;
    latestHash: string;
    updateAvailable: boolean;

    constructor(appID: string, name: string, hash: string, latestHash: string, updateAvailable: boolean) {
        this.appID = appID;
        this.name = name;
        this.hash = hash;
        this.latestHash = latestHash;
        this.updateAvailable = updateAvailable;
    }

    static fromJSON(json: any) {
        return new FlatpakInfo(json.appID, json.name, json.hash, json.latestHash, json.updateAvailable);
    }
}

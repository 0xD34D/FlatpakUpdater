export class FlatpakInfo {
    appID: string;
    name: string;
    localHash: string;
    remoteHash: string;
    remote: string;
    ref: string;
    updateAvailable: boolean;

    constructor(appID: string, name: string, localHash: string, remoteHash: string, remote: string, ref: string, updateAvailable: boolean) {
        this.appID = appID;
        this.name = name;
        this.localHash = localHash;
        this.remoteHash = remoteHash;
        this.remote = remote;
        this.ref = ref;
        this.updateAvailable = updateAvailable;
    }

    static fromJSON(json: any) {
        return new FlatpakInfo(json.appID, json.name, json.localHash, json.remoteHash, json.remote, json.ref, json.updateAvailable);
    }
}

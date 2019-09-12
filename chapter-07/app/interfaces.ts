export interface Browser {
    idx: number,
    name: string;
    uuid: string,
    subscription: any,
    platformName: string,
    platformVersion: string,
    platformLayout: string,
    platformOS: OperatingSystem,
    platformDesc: string,
    subscribed: number
}

export interface OperatingSystem {
    architecture: number,
    family: string,
    version: string
}

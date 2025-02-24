declare class AssetPreloader extends EventTarget {
    constructor(debug?: boolean, useCustomUI?: boolean);
    setDefaults(defaults: Record<string, string>): void;
    loadAssets(newAssets: string[], batchSize?: number, timeoutDuration?: number): void;
    getAsset(url: string): string | null;
}

export default AssetPreloader;
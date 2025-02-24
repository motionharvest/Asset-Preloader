export default class AssetPreloader extends EventTarget {
    constructor(debug = false, useCustomUI = false) {
        super();
        if (AssetPreloader.instance) {
            return AssetPreloader.instance;
        }
        
        AssetPreloader.instance = this;
        this.loadedAssets = {};
        this.loadingQueue = [];
        this.loadingScreen = null;
        this.progressBar = null;
        this.totalAssets = 0;
        this.loadedCount = 0;
        this.defaultAssets = {};
        this.maxRetries = 3;
        this.debug = debug;
        this.useCustomUI = useCustomUI;
    }

    setDefaults(defaults) {
        this.defaultAssets = defaults;
    }

    createLoadingScreen() {
        if (this.useCustomUI || this.loadingScreen) return;
        
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'black';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '9999';

        const progressContainer = document.createElement('div');
        progressContainer.style.width = '50%';
        progressContainer.style.height = '10px';
        progressContainer.style.background = 'darkgray';
        progressContainer.style.borderRadius = '5px';
        progressContainer.style.overflow = 'hidden';

        const progressBar = document.createElement('div');
        progressBar.style.width = '0%';
        progressBar.style.height = '100%';
        progressBar.style.background = 'white';
        progressBar.style.transition = 'width 0.2s ease';

        progressContainer.appendChild(progressBar);
        overlay.appendChild(progressContainer);
        document.body.appendChild(overlay);

        this.loadingScreen = overlay;
        this.progressBar = progressBar;
    }

    updateProgress(url) {
        this.loadedCount += 1;
        const progress = (this.loadedCount / this.totalAssets) * 100;
        if (!this.useCustomUI && this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }
        this.dispatchEvent(new CustomEvent('progress', { detail: { url, progress } }));
        this.dispatchEvent(new CustomEvent('assetLoaded', { detail: { url, asset: this.loadedAssets[url] } }));

        if (this.loadedCount >= this.totalAssets) {
            setTimeout(() => {
                if (!this.useCustomUI && this.loadingScreen && this.loadingScreen.parentNode) {
                    document.body.removeChild(this.loadingScreen);
                }
                this.loadingScreen = null;
                this.dispatchEvent(new Event('complete'));
            }, 500);
        }
    }

    async loadFileWithProgress(url, retries = 0, timeoutDuration = 10000) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutDuration);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);

            if (!response.ok) throw new Error(`Failed to load ${url}: ${response.statusText}`);

            const blob = await response.blob();
            this.loadedAssets[url] = URL.createObjectURL(blob);
            this.updateProgress(url);
        } catch (error) {
            console.error(`Error loading asset: ${url}`, error);
            this.dispatchEvent(new CustomEvent('error', { detail: url }));
            
            if (retries < this.maxRetries) {
                return this.loadFileWithProgress(url, retries + 1, timeoutDuration);
            }

            const ext = url.split('.').pop().toLowerCase();
            if (this.defaultAssets[ext]) {
                this.loadedAssets[url] = this.defaultAssets[ext];
            } else {
                throw new Error(`No default asset specified for failed asset: ${url}`);
            }
            this.updateProgress(url);
        }
    }

    loadAssets(newAssets, batchSize = null, timeoutDuration = 10000) {
        if (!Array.isArray(newAssets) || newAssets.length === 0) return;
        
        const defaultAssetsList = Object.values(this.defaultAssets);
        const assetsToLoad = [...defaultAssetsList, ...newAssets];
        
        this.createLoadingScreen();
        this.loadingQueue = this.loadingQueue.concat(assetsToLoad);
        this.totalAssets = this.loadingQueue.length;
        this.loadedCount = Object.keys(this.loadedAssets).length;

        if (batchSize) {
            for (let i = 0; i < this.loadingQueue.length; i += batchSize) {
                setTimeout(() => {
                    this.loadingQueue.slice(i, i + batchSize).forEach(asset => {
                        if (!this.loadedAssets[asset]) {
                            this.loadFileWithProgress(asset, 0, timeoutDuration);
                        } else {
                            this.updateProgress(asset);
                        }
                    });
                }, i * 100);
            }
        } else {
            this.loadingQueue.forEach(asset => {
                if (!this.loadedAssets[asset]) {
                    this.loadFileWithProgress(asset, 0, timeoutDuration);
                } else {
                    this.updateProgress(asset);
                }
            });
        }
    }

    getAsset(url) {
        return this.loadedAssets[url] || null;
    }
}

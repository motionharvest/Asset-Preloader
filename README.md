# Asset Preloader

Asset Preloader is a lightweight JavaScript module for efficiently preloading assets in web applications. It supports images, videos, sounds, 3D models, and other file types with features such as event-driven progress tracking, retry mechanisms, batch loading, and customizable UI options.

## Features

- ✅ **Singleton Pattern** – Ensures a single instance is used for asset management.
- ✅ **Event-Driven Architecture** – Fires `progress`, `complete`, `error`, and `assetLoaded` events.
- ✅ **Customizable UI** – Disable the default UI and use a custom progress display.
- ✅ **Retry Mechanism** – Retries failed assets up to a defined limit before fallback.
- ✅ **Batch Loading** – Controls how many assets load simultaneously.
- ✅ **Default Asset Fallbacks** – Replace missing assets with predefined placeholders.
- ✅ **Asset-Specific Callbacks** – Respond when an individual asset is loaded.

## Installation

### Using NPM
```sh
npm install @motionharvest/asset-preloader
```

## Usage

### Importing the Preloader
```javascript
import AssetPreloader from '@motionharvest/asset-preloader';
```

### Initializing the Preloader
```javascript
const preloader = new AssetPreloader(true, true); // Debug mode, Custom UI enabled
```

### Setting Default Assets
```javascript
preloader.setDefaults({
    png: 'assets/default.png',
    glb: 'assets/default.glb',
    mp3: 'assets/default.mp3'
});
```

### Loading Assets
```javascript
const assetsToLoad = [
    'assets/image.png',
    'assets/video.mp4',
    'assets/missing_model.glb',
    'assets/sound.mp3'
];
preloader.loadAssets(assetsToLoad, 3, 15000); // Batch size 3, timeout 15s
```

### Listening to Events
```javascript
preloader.addEventListener('progress', (event) => {
    console.log(`Progress: ${event.detail.progress.toFixed(2)}% for ${event.detail.url}`);
});

preloader.addEventListener('assetLoaded', (event) => {
    console.log(`Asset loaded: ${event.detail.url}`);
});

preloader.addEventListener('error', (event) => {
    console.warn(`Asset failed to load: ${event.detail}, using fallback if available.`);
});

preloader.addEventListener('complete', () => {
    console.log('All assets loaded successfully!');
});
```

### Retrieving a Loaded Asset
```javascript
const imageUrl = preloader.getAsset('assets/image.png');
if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    document.body.appendChild(img);
}
```

## API Reference

### `new AssetPreloader(debug = false, useCustomUI = false)`
Creates a singleton instance of the preloader.
- `debug` (boolean) – Enables logging output.
- `useCustomUI` (boolean) – Disables default loading UI if `true`.

### `.setDefaults(defaults)`
Sets default fallback assets per file type.
- `defaults` (object) – Key-value pairs of file extensions and default asset URLs.

### `.loadAssets(assetList, batchSize = null, timeoutDuration = 10000)`
Loads an array of assets with optional batch size and timeout settings.
- `assetList` (array) – List of asset URLs to preload.
- `batchSize` (number) – How many assets to load simultaneously.
- `timeoutDuration` (number) – Maximum time in milliseconds before an asset is considered failed.

### `.getAsset(url)`
Retrieves the loaded asset's blob URL.
- `url` (string) – The original asset URL.
- **Returns**: A blob URL if the asset is loaded, otherwise `null`.

## Events

- **`progress`** – Fired on loading progress updates.
  ```javascript
  preloader.addEventListener('progress', (event) => {
      console.log(`Progress: ${event.detail.progress.toFixed(2)}% for ${event.detail.url}`);
  });
  ```

- **`assetLoaded`** – Fired when an individual asset finishes loading.
  ```javascript
  preloader.addEventListener('assetLoaded', (event) => {
      console.log(`Asset loaded: ${event.detail.url}`);
  });
  ```

- **`error`** – Fired when an asset fails to load.
  ```javascript
  preloader.addEventListener('error', (event) => {
      console.warn(`Failed to load: ${event.detail}`);
  });
  ```

- **`complete`** – Fired when all assets have been loaded.
  ```javascript
  preloader.addEventListener('complete', () => {
      console.log('All assets loaded successfully!');
  });
  ```

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## Author

Developed by Aaron Sherrill.

---

Enjoy using **Asset Preloader**! 🚀

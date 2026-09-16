/**
 * Local Font Loader — plugin entry point.
 *
 * @version 1.5.2
 * @license MIT
 *
 * This file is the build input. The plugin Obsidian loads is the bundled `main.js` at the
 * repository root, produced by `bun run build`; edit the modules under `src/`, never the bundle.
 */
import LocalFontLoaderPlugin from './plugin';

// Obsidian evaluates the bundle as CommonJS and takes the module itself as the plugin class,
// so the entry assigns module.exports directly rather than exposing a default property.
module.exports = LocalFontLoaderPlugin;

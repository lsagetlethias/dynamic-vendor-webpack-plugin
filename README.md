<div align="center">
    <br>

[![npm][npm]][npm-url]

[![deps][deps]][deps-url]
[![node][node]][node-url]

<br>
    <a href="https://github.com/webpack/webpack">
        <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
    </a>
    <h1>dynamic-vendor-webpack-plugin</h1>
    <p>This is a webpack plugin that gives you a way to import vendors with dynamic variable and specific code splitting.</p>
</div>

<h2 align="center">Requirements</h2>

`dynamic-vendor-webpack-plugin` relies on [webpack] 4. It will be updated as needed on major updates of webpack.


<h2 align="center">Install</h2>

```bash
yarn add -D dynamic-vendor-webpack-plugin
# or
npm i --save-dev dynamic-vendor-webpack-plugin
```


<h2 align="center">Usage</h2>

Dynamic vendor code splitting is a two steps code process. First, you need to setup the plugin in your `webpack` config with desired "lazy" vendors, then import the dynamic importer wherever you need in your code.  
FYI, the following examples are based on a Typescript code based application.

**webpack.config.t-s**
```ts
import { DynamicVendorPlugin } from 'dynamic-vendor-webpack-plugin';
import { Configuration } from 'webpack';

const config: Configuration = {
    // ... your webpack configuration
    plugins: [
        new DynamicVendorPlugin({
            vendors: ['my-vendor'],
        }),
    ],
}
export default config;
```

**index.ts**
```ts
// fetch the array of your vendors
// the module is not load by default but wrapped in a pure function
import { dynamicImporter } from 'dynamic-vendor-webpack-plugin/dynamicImporter';

(async () => {
    // run through it
    for (const fn of dynamicImporter) {
        // get the module with the function
        const m = await fn(); 

        // use it
        new (m.default)();
    }
})();
```

This will generate a separated chunk with this vendor (and its exclusive dependencies) loaded on demand by you application.


<h2 align="center">Options</h2>

- `options.vendors: Array<string | VendorEntry>`: The list of vendors by their name of by a more detailed object.
    - `options.vendors[].name: string`: The name of the vendor (dependecy name).
    - `options.vendors[].magicComment: WebpackMagicComment`: List of webpack magic comment import configuration. (see https://webpack.js.org/api/module-methods/#import- )
- `options.webpackChunkName: string`: A name for the dynamic vendor chunk. `'dynamic-vendor'` by default, you can atomically override this for each vendors with a vendor object.

### Conditional vendor
**webpack.config.ts**
```ts
const DEV = process.env.NODE_ENV === 'development';
{
    mode: DEV ? 'development' : 'production',
    plugins: [
        new DynamicVendorPlugin({
            vendors: [
                {
                    // admiting that you have a services third party library
                    name: DEV ? 'mock-service-lib' : 'service-lib',
                },
            ],
        }),
    ],
}
```

### Group similar specific vendor together (i.e. plugins)
**webpack.config.ts**
```ts
import packageJson from './package.json';

{
    plugins: [
        new DynamicVendorPlugin({
            // admiting that you want to lazy blind load all vendors under a specific pattern
            // in this case '@mylib/*'
            vendors: Object.keys(packageJson.dependencies).filter(d => d.startsWith('@mylib/')),
        }),
    ],
}
```

<h2 align="center">Maintainers</h2>
<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars3.githubusercontent.com/u/5783789?v=3&s=150">
        </br>
        <a href="https://github.com/bios21">Lilian Saget-Lethias</a>
      </td>
    </tr>
  <tbody>
</table>


[npm]: https://img.shields.io/npm/v/dynamic-vendor-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/dynamic-vendor-webpack-plugin

[node]: https://img.shields.io/node/v/dynamic-vendor-webpack-plugin.svg
[node-url]: https://nodejs.org

[deps]: https://img.shields.io/david/bios21/dynamic-vendor-webpack-plugin.svg
[deps-url]: https://david-dm.org/bios21/dynamic-vendor-webpack-plugin

[webpack]: https://webpack.org
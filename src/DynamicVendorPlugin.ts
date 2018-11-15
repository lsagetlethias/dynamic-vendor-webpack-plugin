import path from 'path';
import { Compiler, Plugin } from 'webpack';
import { Stats } from './Stats';

interface WebpackMagicComment {
    /**
     * Disables dynamic import parsing when set to `true`.
     */
    webpackIgnore?: boolean;
    /**
     * A name for the new chunk. The placeholders `[index]` and `[request]` are supported within the given string to an incremented number or the actual resolved filename respectively.
     */
    webpackChunkName?: string;
    /**
     * Different modes for resolving dynamic imports can be specified. The following options are supported:
     * - "lazy" (default): Generates a lazy-loadable chunk for each `import()`ed module.
     * - "eager": Generates no extra chunk. All modules are included in the current chunk and no additional network requests are made. A `Promise` is still returned but is already resolved. In contrast to a static import, the module isn't executed until the call to `import()` is made.
     * - "weak": Tries to load the module if the module function has already been loaded in some other way (i. e. another chunk imported it or a script containing the module was loaded). A `Promise` is still returned but, only successfully resolves if the chunks are already on the client. If the module is not available, the `Promise` is rejected. A network request will never be performed. This is useful for universal rendering when required chunks are always manually served in initial requests (embedded within the page), but not in cases where app navigation will trigger an import not initially served.
     */
    webpackMode?: 'lazy' | 'eager' | 'weak';
    /**
     * A regular expression that will be matched against during import resolution.
     * Only modules that match **will be bundled.**
     */
    webpackInclude?: RegExp;
    /**
     * A regular expression that will be matched against during import resolution.
     * Any module that matches **will not be bundled.**
     */
    webpackExclude?: RegExp;
    webpackPrefetch?: boolean | number;
    webpackPreload?: boolean | number;
}

interface VendorEntry {
    /**
     * The name of the vendor (dependecy name).
     */
    name: string;
    /**
     * List of webpack magic comment import configuration.
     */
    magicComment?: WebpackMagicComment;
}

export interface Options {
    /**
     * The list of vendors by their name of by a more detailed object.
     */
    vendors: Array<string | VendorEntry>;
    /**
     * A name for the new chunk. The placeholders `[index]` and `[request]` are supported within the given string to an incremented number or the actual resolved filename respectively.
     */
    webpackChunkName?: string;
}

export class DynamicVendorPlugin implements Plugin {
    private readonly pluginName = this.constructor.name;
    private readonly options: Partial<Options> = {
        webpackChunkName: 'dynamic-vendor',
    };

    public constructor(options: Options) {
        this.options = { ...this.options, ...options };
    }

    private buildContent(): string {
        return this.options.vendors.reduce((previous: string, current): string => {
            let imp: string;
            if (typeof current === 'string') {
                imp = `() => import(/* webpackChunkName: "${this.options.webpackChunkName}" */ '${current}')`;
            } else {
                const chunkName =
                    current.magicComment && current.magicComment.webpackChunkName
                        ? current.magicComment.webpackChunkName
                        : this.options.webpackChunkName;
                const magicComments = current.magicComment
                    ? Object.keys(current.magicComment)
                          .filter(c => c !== 'webpackChunkName')
                          .map(c => {
                              const comment = current.magicComment[c];
                              return `${c}: ${typeof comment === 'string' ? `"${comment}"` : comment}`;
                          })
                    : [];
                magicComments.push(`webpackChunkName: "${chunkName}"`);

                imp = `() => import(/* ${magicComments.join(', ')} */ '${current.name}')`;
            }
            if (previous) {
                return `${previous}, ${imp}`;
            }
            return imp;
        }, '') as string;
    }

    public apply(compiler: Compiler): void {
        const ifs = compiler.inputFileSystem;

        const statStorage: { data: Map<string, [Error | null, Stats]> } = (ifs as any)._statStorage;
        const readFileStorage: { data: Map<string, [Error | null, string]> } = (ifs as any)._readFileStorage;

        const CONTENT = `export const dynamicImporter = [${this.buildContent()}];\n`;

        const PATH = path.resolve(compiler['context'], 'node_modules/dynamic-vendor-webpack-plugin/dynamicImporter');

        compiler.hooks.normalModuleFactory.tap(this.pluginName, nmf => {
            nmf.hooks.beforeResolve.tap(this.pluginName, () => {
                if (readFileStorage.data.has(PATH)) {
                    return;
                }

                statStorage.data.set(PATH, [null, Stats.genericStats(CONTENT)]);
                readFileStorage.data.set(PATH, [null, CONTENT]);
            });
        });
    }
}

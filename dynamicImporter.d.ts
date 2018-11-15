/**
 * This is the dynamic importer.  
 * It will return an array of lazy import to load by calling the wrapping function.
 */
export const dynamicImporter: Array<() => Promise<any>>;

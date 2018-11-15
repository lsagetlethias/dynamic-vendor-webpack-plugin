import constants from 'constants';
import { Stats as BaseStats } from 'fs';

// tslint:disable-next-line:ban-types
type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

type StatsConstructorConfig = Partial<NonFunctionProperties<BaseStats>>;

export class Stats implements BaseStats {
    public dev: number;
    public ino: number;
    public mode: number;
    public nlink: number;
    public uid: number;
    public gid: number;
    public rdev: number;
    public size: number;
    public blksize: number;
    public blocks: number;
    public atimeMs: number;
    public mtimeMs: number;
    public ctimeMs: number;
    public birthtimeMs: number;
    public atime: Date;
    public mtime: Date;
    public ctime: Date;
    public birthtime: Date;

    constructor(config: StatsConstructorConfig) {
        Object.keys(config).forEach(k => {
            this[k] = config[k];
        });
    }

    public static genericStats(content: string): Stats {
        const t = new Date();
        return new Stats({
            atime: t,
            birthtime: t,
            blksize: 4096,
            ctime: t,
            dev: 8675309,
            gid: 20,
            ino: 44700000,
            mode: 33188,
            mtime: t,
            nlink: 1,
            rdev: 0,
            size: content.length,
            uid: 501,
        });
    }

    private checkModeProperty(p: number) {
        // tslint:disable-next-line:no-bitwise
        return (this.mode & constants.S_IFMT) === p;
    }

    public isDirectory() {
        return this.checkModeProperty(constants.S_IFDIR);
    }

    public isFile() {
        return this.checkModeProperty(constants.S_IFREG);
    }

    public isBlockDevice() {
        return this.checkModeProperty(constants.S_IFBLK);
    }

    public isCharacterDevice() {
        return this.checkModeProperty(constants.S_IFCHR);
    }

    public isSymbolicLink() {
        return this.checkModeProperty(constants.S_IFLNK);
    }

    public isFIFO() {
        return this.checkModeProperty(constants.S_IFIFO);
    }

    public isSocket() {
        return this.checkModeProperty(constants.S_IFSOCK);
    }
}

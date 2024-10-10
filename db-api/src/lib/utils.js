import process from 'node:process';

/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
export class UUID {

    static get #lut() {
        const lut = [];
        for (let i = 0; i < 256; i++) {
            lut[i] = `${i < 16 ? '0' : ''}${i.toString(16)}`;
        }
        return lut;
    }

    static generate() {
        const lut = this.#lut;
        const d0 = Math.random() * 0xffffffff | 0;
        const d1 = Math.random() * 0xffffffff | 0;
        const d2 = Math.random() * 0xffffffff | 0;
        const d3 = Math.random() * 0xffffffff | 0;
        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
            lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
            lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
            lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff]
        ;
    }
}

export class GraceShutdown {
    /** @type {Array} */ #modules = [];

    get modules() {
        return this.#modules;
    }

    async createTermFn(event) {
        console.info(`${event} signal received.`);
        return this.graceShutdownHandler();
    }

    #getClientClosePromise = async module => {
        if (module && module.close) {
            return module.close();
        }
        return Promise.resolve();
    }

    async closeAllClients() {
        try {
            await Promise.allSettled(
                this.modules.map(
                    this.#getClientClosePromise
                )
            )
        } catch (error) {
            console.error(error);
            process.exit(1);
        } finally {
            console.log("exiting...");
            process.exit(0);
        }
    }

    graceShutdownHandler = async () => {
        console.info('Gracefully shutting down.');

        await this.closeAllClients();
    }

    constructor(clients) {
        this.#modules = clients;

        const handle = async (eventName) => {
            await this.createTermFn(eventName)
        }

        process.on('SIGINT', handle);
        process.on('SIGTERM', handle);
    }

    static create(modules) {
        return new GraceShutdown(modules);
    }

    addModule(module) {
        this.#modules.push(module);
    }

}

const _shuffle = (array) => {
    let i = array.length - 1
    for (; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const _random = arr => arr[Math.floor(Math.random() * arr.length)];

export class Arr {
    static random(arr, amount = 1, uniq = true) {
        if (amount === 1) {
            return _random(arr)
        }
        if (!uniq) {
            return [...Array(amount)].map(() => _random(arr));
        }
        const result = new Set();
        const tmp = new Set(arr);
        if (tmp.size < amount) {
            amount = tmp.size;
        }
        while (result.size < amount) {
            result.add(_random(arr));
        }
        return Array.from(result);
    }
    static shuffle(arr) {
        return _shuffle(arr);
    }
}

export const runtimeId = UUID.generate();

export const isDev = [
    'dev', 'development', 'test', 'testing', 'local'
].includes(process.env.NODE_ENV)

export default { GraceShutdown, UUID, runtimeId, Arr, isDev };


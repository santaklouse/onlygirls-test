import redis from '@redis/client';
const { RedisClient, createClient } = redis;
import RedisJsonModule from '@redis/json';
import {Logger} from "./logger.js";

const logger = Logger.for('redis');

class RedisConnection {
    /** @type {RedisClient} */ #client;

    static create(options) {
        return new RedisConnection(options);
    }

    /**
     *
     * @return {RedisClient}
     */
    get client() {
        return this.#client
    }

    constructor(host, port = 6379) {
        try {
            this.#client = createClient({
                url: `redis://${host}:${port}`,
                // socket: { tls: true },
                modules: { json: RedisJsonModule },
            })

            this.#initEvents();

            this.client.connect();
        } catch (err) {
            throw err;
        }
    }

    #initEvents() {
        this.#client
            .on('ready', () => logger.info('Redis Client Ready'))
            .on('connect', () => logger.info('Redis Client Connected'))

            .on('reconnecting', () => logger.info('Redis Client Reconnecting'))

            .on('warning', err => logger.warn('Redis Client Warning', err))
            .on('error', err => logger.error('Redis Client Error', err))
            .on('end', () => logger.info('Redis Client Disconnected'))
        ;
    }

    async close() {
        try {
            await this.client.quit();
        } catch (err) {
            logger.error(err.message);
        }
    }
}

export { RedisConnection }



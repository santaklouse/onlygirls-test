import { createPool} from 'mysql2/promise'
import { Pool, PoolConnection } from 'mysql2'
import {Logger} from "./logger.js";

const logger = Logger.for('database');

const DefaultPoolConfig = {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

class DatabaseConnection {
    /** @type {Pool} */ #pool;

    static create(options) {
        return new DatabaseConnection(options);
    }

    /**
     *
     * @return {Pool}
     */
    get pool() {
        return this.#pool
    }

    /**
     *
     * @return {Promise<PoolConnection>}
     */
    async getConnection() {
        return this.pool.getConnection();
    }

    constructor({ host, user, password, database }) {
        const config = {
            ...DefaultPoolConfig,
            host,
            user,
            password,
            database,
        }

        this.#pool = createPool(config);
        this.#initEvents();
    }

    #initEvents() {
        this.#pool
            .on('connection', connection =>
                logger.info(`Connected to MySQL as ${connection.threadId}`)
            )
            .on('release', connection =>
                logger.info(`Connection ${connection.threadId} released`)
            )
            .on('enqueue', () => logger.info('Waiting for available connection slot'))
        ;
    }

    async transaction(callback) {
        /** @type {PoolConnection} */
        const connection = await this.getConnection();
        await connection.beginTransaction();
        try {
            await callback(connection);
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    async execute(sql, values) {
        /** @type {PoolConnection} */
        const connection = await this.getConnection();
        try {
            const [rows, fields] = await connection.execute(sql, values);
            return rows;
        } catch (err) {
            throw err;
        } finally {
            connection.release();
        }
    }

    async query(sql, values) {
        /** @type {PoolConnection} */
        const connection = await this.getConnection();
        try {
            const [rows, fields] = await connection.query(sql, values);
            return rows;
        } catch (err) {
            throw err;
        } finally {
            connection.release();
        }
    }


    async close() {
        try {
            await this.pool.end();
            logger.info('DB connections closed')
        } catch (err) {
            console.error(err.message);
        }
    }

}

export { DatabaseConnection };

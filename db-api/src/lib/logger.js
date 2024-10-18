import {runtimeId} from "./utils.js";
import winston from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";

const { combine, timestamp, json } = winston.format;

const loggerOptions = {
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: {
        runtimeId,
        service: 'main',
    },
    format: combine(
        timestamp({
            format: 'YYYY/MM/DD-hh:mm:ss.SSS A',
        }),
        winston.format.printf(
            (info) => `${info.timestamp} ${info.runtimeId} (${info.service})[${info.level}]: ${info.message}`
        ),
        // json()
    ),
    transports: [new winston.transports.Console()],
    exitOnError: false,
};

const logtailToken = process.env.BETTERSTACK_LOGTAIL_TOKEN;
let logtail;
if (logtailToken) {
    logtail = new Logtail(logtailToken);
    loggerOptions.transports.push(new LogtailTransport(logtail));
}

const mainLogger = winston.createLogger({
    ...loggerOptions,

});

export class AppLogger {
    serviceName = '';

    /** @type {Map<string,AppLogger>} */
    static #instances = new Map();

    static loggerOptions = {...loggerOptions};

    /** @type {winston.Logger} */
    #logger = null;

    static getInstance(serviceName) {
        if (!this.#instances.has(serviceName)) {
            this.#instances.set(serviceName, new AppLogger(serviceName));
        }
        return this.#instances.get(serviceName);
    }

    get isMain() {
        return !this.serviceName;
    }

    /**
     * @return {winston.Logger}
    */
    get logger() {
        return this.#logger;
    }

    static createMain() {
        return new AppLogger();
    }

    static log = (...args) => {
        mainLogger.info(...args);
    }

    log = (...args) => this.logger.log.apply(this.logger, ['debug', ...args])

    debug = (...args) => this.logger.log.apply(this.logger, ['debug', ...args])
    info = (...args) => this.logger.log.apply(this.logger, ['info', ...args])
    warn = (...args) => this.logger.log.apply(this.logger, ['warn', ...args])
    error = (...args) => this.logger.log.apply(this.logger, ['error', ...args])
    http = (...args) => this.logger.log.apply(this.logger, ['http', ...args])
    profile = (...args) => this.logger.profile.call(this.logger, ...args)

    static getServiceLogger = serviceName => {
        if (!winston.loggers.has(serviceName)) {
            return winston.loggers.add(serviceName, {
                ...this.loggerOptions,
                defaultMeta: {
                    runtimeId,
                    service: serviceName,
                },
            });
        }
        return winston.loggers.get(serviceName);
    }

    getServiceLogger = serviceName => {
        return AppLogger.getServiceLogger(serviceName);
    }

    static for(serviceName) {
        if (!this.#instances.has(serviceName)) {
            this.#instances.set(serviceName, new AppLogger(serviceName));

        }
        return this.#instances.get(serviceName);
    }

    for(serviceName) {
        return AppLogger.for(serviceName);
    }

    constructor(serviceName) {
        if (!serviceName) {
            this.serviceName = null;
            this.#logger = mainLogger;
            return;
        }
        if (AppLogger.#instances.has(serviceName)) {
            return AppLogger.#instances.get(serviceName);
        }
        this.serviceName = serviceName;
        this.#logger = this.getServiceLogger(serviceName);
    }

    async close() {
        try {
            await mainLogger.close();
            if (logtail && logtail.flush()) {
                await logtail.flush();
            }
        } catch (err) {
            console.error(err.message);
        }
    }
}
export const Logger = AppLogger.createMain();

export default { Logger, AppLogger };

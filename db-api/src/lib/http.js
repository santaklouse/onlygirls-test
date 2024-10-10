import express from 'express'
import morgan from 'morgan'
import {Logger} from "./logger.js";
const logger = Logger.for('http');

const stream = {
    write: logger.http,
};

const skip = () => {
    // Don't log during tests
    return process.env.NODE_ENV === 'test';
};

const morganMiddleware = morgan(
    ":remote-addr :method :url :status :res[content-length] - :response-time ms",
    { stream, skip }
);

export class HttpAppServer {
    /** @type {http.Server} */ #server;
    /** @type {Express} */ #app = express();
    /** @type {Number} */ port;

    get = this.app.get.bind(this.app)
    post = this.app.post.bind(this.app)
    put = this.app.put.bind(this.app)
    delete = this.app.delete.bind(this.app)
    use = this.app.use.bind(this.app)
    all = this.app.all.bind(this.app)
    route = this.app.route.bind(this.app)

    static #instance = null;
    router = express.Router();

    get server() {
        return this.#server;
    }

    set server(server) {
        this.#server = server;
    }

    get app() {
        return this.#app;
    }

    constructor() {
        if (HttpAppServer.#instance) {
            return HttpAppServer.#instance;
        }

        this.app.use(morganMiddleware)

        this.router.use(express.json());
        this.router.use(express.urlencoded({ extended: true }));
    }

    static create() {
        return this.#instance = new this();
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = this.create();
        }
        return this.#instance;
    }

    start(port) {
        this.port = port;
        this.use('/api', this.router);
        this.server = this.app.listen(this.port, () =>
            logger.info(`API running on http://localhost:${port}/api`)
        );

        return this;
    }

    close = () => new Promise((resolve, reject) => {
        this.server.close((err) => {
            if (err) {
                reject(err);
            } else {
                logger.info('Http server closed.');
                resolve();
            }
        });
    });

}

export const httpServer = HttpAppServer.create();

export default {
    httpServer,
    HttpAppServer
}

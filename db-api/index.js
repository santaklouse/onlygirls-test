import process from 'node:process';
import { GraceShutdown} from "./src/lib/utils.js";
import {Logger} from "./src/lib/logger.js";
import {httpServer} from "./src/lib/http.js";
import {Models} from "./src/models.js";

const logger = Logger;

const {
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE,
    REDIS_HOST,
    REDIS_PORT,
    PORT: port = 3000,
    REDIS_CACHE
} = process.env;

const config = {
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE,
    REDIS_HOST,
    REDIS_PORT,
    port,
    REDIS_CACHE
};

logger.info('Starting server...');
logger.debug('config: ', {config});

const modelsModule = new Models(config);

httpServer.router
    .get('/models', async (req, res) => {
        const sessionId = req.query.session_id;
        const modelId = req.query.include_model_id;
        logger.debug({ sessionId, modelId });
        try {
            let models = await modelsModule.getRandom10TopRatedModels(sessionId, modelId);
            console.log('model ids', models.map(m => m.id))
            res.status(200).json(models);
        } catch (error) {
            logger.error(error);
            res.status(500).json({
                message: 'Error getting models.',
                error: error.message
            });
        }
    })
    .put('/models/grade', async (req, res) => {
        const { model_id, type, ip, session_id } = req.body;
        try {
            await modelsModule.saveSwipeAction({model_id, type, ip, session_id});
        } catch (error) {
            res.status(500).json({
                message: 'Error saving user swipe.',
                error: error.message
            });
            return;
        }
        res.status(200).json({
            message: 'Swipe saved successfully',
            error: null
        });
    })
;
const appServer = httpServer.start(port);

GraceShutdown.create([
    appServer,
    modelsModule,
    logger
]);

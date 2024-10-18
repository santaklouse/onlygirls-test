import {Logger} from "./lib/logger.js";
import {DatabaseConnection} from "./lib/db.js";
import {RedisConnection} from "./lib/redis.js";
import {Arr} from "./lib/utils.js";

const logger = Logger.for('Models');

const ofUserDefaultFieldsList = [
    'id', // number
    'avatar', // string (image url)
    'avatar_thumbs', // { "c50": (image url), "c144": (image url) }
    'header', // string (image url)
    'header_thumbs', //{ "w480": (image url), "w760": (image url) }
    'header_size', //{ "width": 2544, "height": 3392 }
    'name', //string
    'username', //string
    'location', //string
    'about', //string
    'raw_about', //string
    'photos_count', // number
    'posts_count', // number
    'videos_count', // number
    'website', // string
    'favorites_count', // int
];

const TopRatedModelIdsCacheKey = 'top_rated_model_ids';

const SaveSwipeSql = 'INSERT INTO model_swipes (model_id, `like`, ip, session_id) VALUES (?, ?, ?, ?)';

const ViewedModelsCacheKey = session_id => `viewed_models:${session_id}`;
const ViewedModelsCacheTTL = 60 * 60 * 24; // 1 day
const TopRatedModelsCacheTTL = 60 * 60 * 12; // 12 hours

export class Models {

    get redisClient() {
        return this.redisConnection.client;
    }

    useRedisCache = false;

    config = {};
    /**
     * @type {DatabaseConnection}
     * @private
     */
    _dbClient;

    /**
     * @type {RedisConnection}
     */
    redisConnection;

    get dbClient() {
        return this._dbClient;
    }

    constructor({DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE, REDIS_HOST, REDIS_PORT, REDIS_CACHE}) {
        this.config = {DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE};
        this.useRedisCache = REDIS_CACHE;
        this._dbClient = new DatabaseConnection({
            host: DB_HOST,
            user: DB_USERNAME,
            password: DB_PASSWORD,
            database: DB_DATABASE
        });

        this.redisConnection = RedisConnection.create(REDIS_HOST, REDIS_PORT);

        this.getTopRatedModelIdsCached().then((data) => {
            logger.info(`Top rated models cached (${data.length})`, {data});
        })
    }

    /**
     * Function to get top-rated models from database by ids
     * @async
     * @param modelIds
     * @param fields
     * @return {Promise<[]>}
     */
    getTopRatedModelsByIds = async(modelIds, fields = []) => {
        logger.profile('getTopRatedModelsByIds');
        fields = [
            ...ofUserDefaultFieldsList,
            ...fields
        ];
        fields = new Set(fields);

        const fieldNames = Array.from(fields).map(name => `u.${name} as ${name}`)
        const sql = `
            SELECT ${fieldNames.join(',')}
            FROM of_users u
            WHERE u.id IN (${modelIds.join(',')})
        `;

        const rows = await this.dbClient.query(sql);
        logger.info(`getTopRatedModelsByIds: ${rows.length}`, {count: rows.length})
        if (!rows || !rows.length) {
            return [];
        }
        logger.profile('getTopRatedModelsByIds');
        return rows;
    }

    /**
     * Function to get top-rated model ids
     * @async
     * @return {Promise<*>}
     */
    getTopRatedModelIds = async () => {
        logger.profile('getTopRatedModelIds');
        const sql = `
            SELECT DISTINCT u.id AS id
            FROM of_users u
            LEFT JOIN (
                SELECT model_id AS id, COUNT(*) AS likes_amount
                FROM model_swipes
                WHERE \`like\` = TRUE
                GROUP BY model_id
                HAVING COUNT(*) > 1000
            ) AS topRated ON topRated.id = u.id
            WHERE (u.header IS NOT NULL OR u.avatar IS NOT NULL) AND (
                u.favorites_count > 1000
               OR topRated.likes_amount IS NOT NULL)
            ;
        `;

        const rows = await this.dbClient.query(sql);
        logger.info(`getTopRatedModelIds (${rows.length})`, {count: rows.length});
        logger.profile('getTopRatedModelIds');
        return rows.map(item => item.id);
    }

    /**
     * Get top-rated models ids from cache
     * @async
     * @return {Promise<*>}
     */
    getTopRatedModelIdsFromCache = async () => {
        logger.profile('getTopRatedModelIdsFromCache');
        const cachedResult = await this.redisClient.sMembers(TopRatedModelIdsCacheKey);

        if (cachedResult && cachedResult.length) {
            logger.debug(`getTopRatedModelIdsFromCache cache exists ${TopRatedModelIdsCacheKey} (${cachedResult.length})`, { cachedResult })
            logger.profile('getTopRatedModelIdsFromCache');
            return cachedResult;
        }
        logger.profile('getTopRatedModelIdsFromCache');
        return [];
    }

    /**
     * Function to check if top-rated models cache exists in redis
     * @async
     * @return {Promise<Boolean>}
     */
    isTopRatedModelIdsCacheExists = async () => !!(await this.redisClient.exists(TopRatedModelIdsCacheKey));

    /**
     * Cache top-rated models cache
     * @async
     * @return {Promise<*[]|*>}
     */
    createTopRatedModelIdsCache = async () => {
        logger.profile('createTopRatedModelIdsCache');
        let data = await this.getTopRatedModelIds();
        logger.debug(`createTopRatedModelIdsCache (${data.length})`, {count: data.length})
        if (!data.length) {
            return [];
        }
        if (!this.useRedisCache) {
            logger.profile('createTopRatedModelIdsCache');
            return data;
        }
        data = data.map(id => id.toString());

        try {
            await this.redisClient.sAdd(TopRatedModelIdsCacheKey, data);
            await this.redisClient.expire(TopRatedModelIdsCacheKey, TopRatedModelsCacheTTL);
        } catch (e) {
            logger.error(`createTopRatedModelIdsCache error: ${e.message}`);
        }

        logger.profile('createTopRatedModelIdsCache');
        return data;
    }

    getTopRatedModelIdsCached = async() => {
        if (await this.isTopRatedModelIdsCacheExists()) {
            return await this.getTopRatedModelIdsFromCache();
        }
        return await this.createTopRatedModelIdsCache();
    }

    /**
     * Get viewed models for session from DB
     * @async
     * @param session_id
     * @return {Promise<*>}
     */
    getViewedUserModelsFromDb = async session_id => {
        logger.profile('getViewedUserModels');
        const sql = `SELECT distinct model_id as id FROM model_swipes WHERE session_id = ?`;
        const rows = await this.dbClient.query(sql, [session_id]);
        logger.profile('getViewedUserModels');
        return rows.map(row => row.id);
    }

    isViewedModelsCacheExists = async session_id => {
        const cacheKey = ViewedModelsCacheKey(session_id);
        return await this.redisClient.exists(cacheKey);
    }

    /**
     * Get viewed models for session
     * @async
     * @param session_id
     * @param force
     * @return {Promise<*>}
     */
    getViewedUserModels = async (session_id, force = false) => {
        if (!(await this.isViewedModelsCacheExists(session_id)) && force)
            return await this.createViewedUserModelsCache(session_id);

        return await this.getViewedUserModelsCached(session_id);
    }

    /**
     * Create viewed models cache
     * @async
     * @param session_id
     * @return {Promise<{length}|*|*[]>}
     */
    createViewedUserModelsCache = async session_id => {
        logger.profile('createViewedUserModelsCache');
        const data = await this.getViewedUserModelsFromDb(session_id);
        if (!data.length) {
            logger.profile('createViewedUserModelsCache');
            return [];
        }
        await this.redisClient.sAdd(cacheKey, data.map(id => id.toString()));
        await this.redisClient.expire(cacheKey, ViewedModelsCacheTTL);
        logger.profile('createViewedUserModelsCache');
        return data;
    }

    /**
     * Get viewed models for user from cache
     * @async
     * @param session_id
     * @return {Promise<*>}
     */
    getViewedUserModelsCached = async (session_id) => {
        logger.profile('getViewedUserModelsCached');

        if (!(await this.isViewedModelsCacheExists(session_id))) {
            logger.profile('getViewedUserModelsCached');
            return [];
        }
        const cacheKey = ViewedModelsCacheKey(session_id);
        const cachedResult = await this.redisClient.sMembers(cacheKey);
        logger.debug(`cache exists ${cacheKey}`, { cachedResult })
        logger.profile('getViewedUserModelsCached');
        return cachedResult;
    }

    /**
     * Get N top-rated models except already viewed
     * @param session_id
     * @param amount
     * @param onlyIds
     * @return {Promise<*|[]>}
     */
    getRandomNTopRatedModels = async (session_id, amount, onlyIds = false) => {
        logger.profile('getRandomNTopRatedModels');
        const exceptModelIds = await this.getViewedUserModels(session_id);

        logger.debug(`exceptModelIds ${session_id} (${exceptModelIds.length})`, {exceptModelIds})
        const topRatedModelIdsCached = await this.getTopRatedModelIdsCached();

        const allNotViewedRatedModelIds = topRatedModelIdsCached
            .filter(modelId => !exceptModelIds.includes(modelId));

        logger.debug(`allNotViewedRatedModelIds (${allNotViewedRatedModelIds.length})`, {count: allNotViewedRatedModelIds.length});

        const randomTopRatedModelIds = Arr.random(allNotViewedRatedModelIds, amount);

        logger.debug(`random10TopRatedModelIds (${randomTopRatedModelIds.length}) [${randomTopRatedModelIds.join(', ')}]`, {count: randomTopRatedModelIds.length});

        if (!randomTopRatedModelIds.length) {
            logger.profile('getRandomNTopRatedModels');
            return [];
        }
        if (onlyIds) {
            logger.profile('getRandomNTopRatedModels');
            return randomTopRatedModelIds;
        }
        const result = await this.getTopRatedModelsByIds(randomTopRatedModelIds);
        logger.profile('getRandomNTopRatedModels');
        return result;
    }

    isModelExistsAndTopRated = async model_id => {
        if (!model_id) {
            return false;
        }
        const topRatedModelIdsCached = await this.getTopRatedModelIdsCached();
        return topRatedModelIdsCached.includes(model_id)
    }

    /**
     * Get 10 random top-rated models for a user session
     * @param session_id
     * @param model_id
     * @return {Promise<*|[]>}
     */
    getRandom10TopRatedModels = async (session_id, model_id = null) => {
        logger.profile('getRandom10TopRatedModels');
        const random10TopRatedModelIds = await this.getRandomNTopRatedModels(session_id, 10, true);

        if (await this.isModelExistsAndTopRated(model_id)) {
            if (random10TopRatedModelIds.includes(model_id)) {
                random10TopRatedModelIds.splice(random10TopRatedModelIds.indexOf(model_id), 1);
                random10TopRatedModelIds.unshift(model_id)
            } else {
                random10TopRatedModelIds[0] = model_id;
            }
        }

        logger.debug(`random10TopRatedModelIds (${random10TopRatedModelIds.length}) [${random10TopRatedModelIds.join(', ')}]`, {count: random10TopRatedModelIds.length});

        if (!random10TopRatedModelIds.length) {
            return [];
        }
        const result = await this.getTopRatedModelsByIds(random10TopRatedModelIds);
        logger.profile('getRandom10TopRatedModels');
        return result;
    }

    /**
     * Save swipe action
     *
     * @param model_id
     * @param like
     * @param ip
     * @param session_id
     * @async
     * @return {Promise<void>}
     */
    saveSwipeAction = async ({model_id, type, ip, session_id}) => {
        const cacheKey = ViewedModelsCacheKey(session_id)

        const values = [model_id, type === 'like', ip, session_id];
        logger.info(`saveSwipeAction ${cacheKey}`, {model_id, type, ip, session_id});
        try {
            await this.dbClient.execute(SaveSwipeSql, values);
            await this.redisClient.sAdd(cacheKey, [model_id.toString()]);
            await this.redisClient.expire(cacheKey, ViewedModelsCacheTTL);
            logger.info('Swipe saved successfully', {values});
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async close() {
        try {
            return await Promise.allSettled([
                this.dbClient.close(),
                this.redisConnection.close()
            ]);
        } catch (err) {
            console.error(err.message);
        }
    }

}

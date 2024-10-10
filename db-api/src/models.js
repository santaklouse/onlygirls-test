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

const TopRatedModelsCacheKey = 'top_rated_models_hash_json';

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
    }

    /**
     * Function to store all top-rated models in redis as hash with key `top_rated_models_hash_json`
     * and field `model_id` and value `model`
     * @async
     * @param models
     * @return {Promise<void>}
     */
    cacheTopRatedModels = async (models) => {
        if (!this.useRedisCache) {
            return;
        }
        const hashMap = {};
        for (let model of models) {
            hashMap[model.id] = JSON.stringify(model);
        }

        await this.redisClient.hSet(TopRatedModelsCacheKey, hashMap);
        await this.redisClient.expire(TopRatedModelsCacheKey, TopRatedModelsCacheTTL);
    }

    /**
     * Function to get top-rated models by ids from redis
     * @async
     * @param ids
     * @return {Promise<*>}
     */
    getTopRatedModelsByIdsFromCache = async (ids = []) => {
        const models = await this.redisClient.hmGet(TopRatedModelsCacheKey, ids.map(id => `${id}`));
        if (!models) {
            return [];
        }
        return models.map(model => JSON.parse(model));
    }

    /**
     * Function to check if top-rated models cache exists in redis
     * @async
     * @return {Promise<Boolean>}
     */
    isTopRatedModelsCacheExists = async () => !!(await this.redisClient.exists(TopRatedModelsCacheKey));

    /**
     * Function to get top-rated models from database
     * @async
     * @param fields
     * @return {Promise<*>}
     */
    getTopRatedModels = async (fields = []) => {
        fields = [
            ...ofUserDefaultFieldsList,
            ...fields
        ];
        fields = new Set(fields);
        if (fields.has('likes_amount')) {
            fields.delete('likes_amount');
        }

        const fieldNames = Array.from(fields).map(name => `u.${name} as ${name}`)
        const sql = `
            SELECT ${fieldNames.join(',')},
                   COALESCE(topRated.likes_amount, 0) AS likes_amount
            FROM of_users u
            LEFT JOIN (
                SELECT model_id AS id, COUNT(*) AS likes_amount
                FROM model_swipes
                WHERE \`like\` = TRUE
                GROUP BY model_id
                HAVING COUNT(*) > 1000
            ) AS topRated ON topRated.id = u.id
            WHERE u.favorites_count > 1000
               OR topRated.likes_amount IS NOT NULL;
        `;

        const rows = await this.dbClient.query(sql);
        logger.info('getTopRatedModels', {count: rows.length});
        return rows;
    }

    /**
     * Cache top-rated models cache
     * @async
     * @return {Promise<*[]|*>}
     */
    createTopRatedModelsCache = async () => {
        const data = await this.getTopRatedModels();
        logger.debug('getTopRatedModels', {count: data.length})
        if (!data) {
            return [];
        }
        if (!this.useRedisCache) {
            return data;
        }
        await this.cacheTopRatedModels(data);
        return data;
    }

    /**
     * Get top-rated models from cache
     * @async
     * @param modelIds
     * @return {Promise<[]>}
     */
    getTopRatedModelsCached = async(modelIds = []) => {
        if (await this.isTopRatedModelsCacheExists()) {
            return await this.getTopRatedModelsByIdsFromCache(modelIds);
        }
        const data = this.createTopRatedModelsCache();
        if (!modelIds.length) {
            return data;
        }
        return data.filter(model => modelIds.includes(model.id));
    }

    /**
     * Get viewed models for session from DB
     * @async
     * @param session_id
     * @return {Promise<*>}
     */
    getViewedUserModels = async session_id => {
        const sql = `SELECT distinct model_id as id FROM model_swipes WHERE session_id = ?`;
        const rows = await this.dbClient.query(sql, [session_id]);
        console.log(`getViewedUserModels ${session_id}`, rows)
        return rows.map(row => row.id);
    }

    /**
     * Get viewed models for user from cache or DB
     * @async
     * @param session_id
     * @return {Promise<*>}
     */
    getViewedUserModelsCached = async (session_id) => {
        const cacheKey = ViewedModelsCacheKey(session_id);
        const cachedResult = await this.redisClient.sMembers(cacheKey);

        if (cachedResult && cachedResult.length) {
            logger.debug(`cache exists ${cacheKey}`, { cachedResult })
            return cachedResult;
        }

        const data = await this.getViewedUserModels(session_id);
        if (!data.length) {
            return [];
        }
        await this.redisClient.sAdd(cacheKey, ...data.map(id => id.toString()));
        await this.redisClient.expire(cacheKey, ViewedModelsCacheTTL);
        return data;
    }

    /**
     * Get top-rated models for a user session
     * @param session_id
     * @param model_id
     * @return {Promise<*|[]>}
     */
    getRandom10TopRatedModels = async (session_id, model_id = null) => {
        const exceptModelIds = await this.getViewedUserModelsCached(session_id);

        console.log(`exceptModelIds ${session_id}`, exceptModelIds)
        let topRatedModelIdsCached;
        if (!await this.isTopRatedModelsCacheExists()) {
            const models = await this.createTopRatedModelsCache();
            topRatedModelIdsCached = models.map(model => model.id);
        } else {
            topRatedModelIdsCached = await this.getAllTopRatedModelIdsCached();
        }

        const allNotViewedRatedModelIds = topRatedModelIdsCached
            .filter(modelId => !exceptModelIds.includes(modelId));

        const random10TopRatedModelIds = Arr.random(allNotViewedRatedModelIds, 10);

        if (model_id) {
            if (random10TopRatedModelIds.includes(model_id)) {
                random10TopRatedModelIds.splice(random10TopRatedModelIds.indexOf(model_id), 1);
                random10TopRatedModelIds.unshift(model_id)
            } else {
                random10TopRatedModelIds[0] = model_id;
            }
        }

        logger.debug('allNotViewedRatedModels', {count: random10TopRatedModelIds.length});
        return await this.getTopRatedModelsCached(random10TopRatedModelIds);
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
            await this.redisClient.sAdd(cacheKey, model_id.toString());
            await this.redisClient.expire(cacheKey, ViewedModelsCacheTTL);
            logger.info('Swipe saved successfully', {values});
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    /**
     * Function to get all top-rated models ids from redis
     * @async
     * @return {Promise<*>}
     */
    getAllTopRatedModelIdsCached = async () => await this.redisClient.hKeys(TopRatedModelsCacheKey);

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

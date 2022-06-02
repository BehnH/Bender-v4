import { EventEmitter } from 'stream';
import * as types from '../data/types';
import * as gatewayTypes from '../data/gatewayTypes';
import APIInterface from './apiInterface';
import CacheHandler from '../utils/cacheHandler';
import Gateway from './gateway';
import Logger from './logger';
import { GATEWAY_ERROR_RECONNECT, GATEWAY_ERROR_RECONNECT_TIMEOUT, GATEWAY_PARAMS, USE_CACHE } from '../data/constants';
import { CLIENT_STATE } from '../data/numberTypes';
import EventManager from './eventManager';
import Shard from './shard';

export default class Bot extends EventEmitter {
    api: APIInterface;
    cache: CacheHandler;
    gateway: Gateway;
    logger: Logger;
    events: EventManager;

    shard?: Shard;
    user!: types.User;
    application?: types.PartialApplication;

    timeouts: types.TimeoutList;
    state: CLIENT_STATE;
    useCache: boolean;

    constructor(shard_data?: gatewayTypes.ShardConnectionData) {
        super();
        this.api = new APIInterface(this, true);
        this.cache = new CacheHandler(this);
        this.gateway = new Gateway(this);
        this.logger = new Logger(this);
        this.events = new EventManager(this);

        if (shard_data) {
            this.shard = new Shard(this, shard_data);
        }

        this.timeouts = {
            gatewayError: []
        };
        this.state = CLIENT_STATE.DEAD;
        this.useCache = USE_CACHE;

        this.events.addAllListeners();

        this.on("REDIS_ERROR", err => this.logger.handleError('REDIS ERROR', err));
    }

    async connect(identifyData: gatewayTypes.IdentifyData) {
        this.logger.debug('BOT CONNECT', 'Connect method called...');
        this.timeouts.gatewayError = [];
        let gatewayInfo: gatewayTypes.GatewayBotInfo | null = null;
        if (this.useCache) {
            this.logger.debug('BOT CONNECT', 'Checking cache for gateway info...');
            gatewayInfo = await this.cache.gatewayInfo.get();
        }
        if (!gatewayInfo) {
            this.logger.debug('BOT CONNECT', 'Cache enabled, but no cached gateway info found...')
            gatewayInfo = await this.api.gateway.getBotInfo().catch(err => {
                this.logger.handleError('GET GATEWAY', err);
                return null;
            });
        }
        if (!gatewayInfo) {
            if (GATEWAY_ERROR_RECONNECT) {
                this.logger.debug('GET GATEWAY', `Retrying in ${GATEWAY_ERROR_RECONNECT_TIMEOUT}ms...`);
                this.timeouts.gatewayError.push(setTimeout(() => this.connect(identifyData), GATEWAY_ERROR_RECONNECT_TIMEOUT));
                return null; // TODO: better way to indicate a retry will happen?
            } else {
                this.logger.handleError('GET GATEWAY', 'Failed to get gateway, and retrying is not enabled.');
                process.exit(1);
            }
        }
        this.logger.debug('BOT CONNECT', gatewayInfo);
        return this.gateway.connect(gatewayInfo.url, GATEWAY_PARAMS).then(() => {
            return this.gateway.identify(identifyData);
        });
    }
}
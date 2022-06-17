import { EventHandler } from '../types/types';
import { PresenceUpdateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class PresenceUpdateHandler extends EventHandler<PresenceUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (/*eventData: PresenceUpdateData*/) => {
        // TODO: cache presences for /userinfo & /playing
    }

    handler = (/*eventData: PresenceUpdateData*/) => {
        // TODO: anti-advertising/gamefilter functions
    }
}
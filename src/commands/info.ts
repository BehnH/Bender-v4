import { ICommand, CommandUtils } from '../structures/command';
import Bot from '../structures/bot';
import * as types from '../data/types';
import { COMMAND_OPTION_TYPES } from '../data/numberTypes';
import LangUtils from '../utils/language';

import userInfoSubcommand from './info/userinfo';

export default class InfoCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('INFO_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('INFO_NAME');

    readonly description = LangUtils.get('INFO_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('INFO_DESCRIPTION');

    readonly dm_permission: boolean = true;

    readonly options: types.CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: 'user',
        name_localizations: LangUtils.getLocalizationMap('USER_INFO_SUBCOMMAND'),

        description: LangUtils.get('USER_INFO_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('USER_INFO_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.USER,

            name: LangUtils.get('USER_INFO_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('USER_INFO_OPTION'),

            description: LangUtils.get('USER_INFO_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('USER_INFO_OPTION_DESCRIPTION'),

            required: true
        }]
    }];

    run(interaction: types.Interaction): types.CommandResponse {
        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        const target = args?.[0]?.options?.[0]?.value;
        switch (subcommand) {
            case 'user':
                return userInfoSubcommand.bind(this)(interaction, target);
        }
        return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
    }
}
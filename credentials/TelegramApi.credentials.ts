import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TelegramApi implements ICredentialType {
	name = 'telegramApi';
	displayName = 'Telegram API';
	documentationUrl = 'https://core.telegram.org/bots/api';
	properties: INodeProperties[] = [
		{
			displayName: 'Bot Token',
			name: 'botToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The bot token from BotFather',
			required: true,
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.telegram.org',
			url: '/bot{{$credentials.botToken}}/getMe',
			method: 'GET',
		},
	};
}

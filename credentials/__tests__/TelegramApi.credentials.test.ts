import { TelegramApi } from '../TelegramApi.credentials';

describe('TelegramApi Credentials', () => {
	describe('properties', () => {
		it('should have correct name and displayName', () => {
			const credentials = new TelegramApi();
			expect(credentials.name).toBe('telegramApi');
			expect(credentials.displayName).toBe('Telegram API');
		});

		it('should have correct documentation URL', () => {
			const credentials = new TelegramApi();
			expect(credentials.documentationUrl).toBe('https://core.telegram.org/bots/api');
		});

		it('should have botToken property', () => {
			const credentials = new TelegramApi();
			expect(credentials.properties).toHaveLength(1);
			
			const botTokenProperty = credentials.properties[0];
			expect(botTokenProperty.displayName).toBe('Bot Token');
			expect(botTokenProperty.name).toBe('botToken');
			expect(botTokenProperty.type).toBe('string');
			expect(botTokenProperty.typeOptions?.password).toBe(true);
			expect(botTokenProperty.required).toBe(true);
		});
	});

	describe('test configuration', () => {
		it('should have correct test request configuration', () => {
			const credentials = new TelegramApi();
			expect(credentials.test).toBeDefined();
			expect(credentials.test.request.baseURL).toBe('https://api.telegram.org');
			expect(credentials.test.request.url).toBe('/bot{{$credentials.botToken}}/getMe');
			expect(credentials.test.request.method).toBe('GET');
		});
	});
});

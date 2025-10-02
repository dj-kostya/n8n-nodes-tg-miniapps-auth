import { TelegramMiniAppsAuth } from '../nodes/TelegramMiniAppsAuth/TelegramMiniAppsAuth.node';
import { TelegramApi } from '../credentials/TelegramApi.credentials';
import { generateTestInitData, testUsers, testBotTokens } from './test-data';

describe('Smoke Tests', () => {
	describe('Node instantiation', () => {
		it('should create TelegramMiniAppsAuth node instance', () => {
			const node = new TelegramMiniAppsAuth();
			expect(node).toBeDefined();
			expect(node.description).toBeDefined();
			expect(node.description.name).toBe('telegramMiniAppsAuth');
		});

		it('should create TelegramApi credentials instance', () => {
			const credentials = new TelegramApi();
			expect(credentials).toBeDefined();
			expect(credentials.name).toBe('telegramApi');
		});
	});

	describe('Test data generation', () => {
		it('should generate valid test init data', () => {
			const initData = generateTestInitData(testUsers.basic, 'test-query', testBotTokens.valid);
			expect(initData).toBeDefined();
			expect(typeof initData).toBe('string');
			expect(initData).toContain('query_id=test-query');
			expect(initData).toContain('user=');
			expect(initData).toContain('auth_date=');
			expect(initData).toContain('hash=');
		});

		it('should generate different init data for different users', () => {
			const initData1 = generateTestInitData(testUsers.basic, 'query-1', testBotTokens.valid);
			const initData2 = generateTestInitData(testUsers.minimal, 'query-2', testBotTokens.valid);
			
			expect(initData1).not.toBe(initData2);
			expect(initData1).toContain('query_id=query-1');
			expect(initData2).toContain('query_id=query-2');
		});
	});

	describe('Node description validation', () => {
		it('should have required properties in node description', () => {
			const node = new TelegramMiniAppsAuth();
			const description = node.description;
			
			expect(description.displayName).toBe('Telegram Mini Apps Auth');
			expect(description.name).toBe('telegramMiniAppsAuth');
			expect(description.version).toBe(1);
			expect(description.inputs).toEqual(['main']);
			expect(description.outputs).toEqual(['main']);
			expect(description.credentials).toHaveLength(1);
			expect(description.credentials?.[0].name).toBe('telegramApi');
			expect(description.credentials?.[0].required).toBe(true);
		});

		it('should have required properties in credentials description', () => {
			const credentials = new TelegramApi();
			
			expect(credentials.name).toBe('telegramApi');
			expect(credentials.displayName).toBe('Telegram API');
			expect(credentials.documentationUrl).toBe('https://core.telegram.org/bots/api');
			expect(credentials.properties).toHaveLength(1);
			expect(credentials.properties[0].name).toBe('botToken');
			expect(credentials.properties[0].required).toBe(true);
		});
	});

	describe('Test users validation', () => {
		it('should have valid test users', () => {
			expect(testUsers.basic.id).toBe(279058397);
			expect(testUsers.basic.first_name).toBe('Vladislav');
			expect(testUsers.minimal.id).toBe(123456789);
			expect(testUsers.minimal.first_name).toBe('John');
		});

		it('should have different user IDs', () => {
			const userIds = [
				testUsers.basic.id,
				testUsers.minimal.id,
				testUsers.premium.id,
				testUsers.unicode.id
			];
			
			const uniqueIds = new Set(userIds);
			expect(uniqueIds.size).toBe(userIds.length);
		});
	});

	describe('Bot tokens validation', () => {
		it('should have valid bot token format', () => {
			expect(testBotTokens.valid).toMatch(/^\d+:[A-Za-z0-9_-]+$/);
		});

		it('should have invalid bot token for testing', () => {
			expect(testBotTokens.invalid).toBe('invalid-token');
			expect(testBotTokens.empty).toBe('');
		});
	});
});

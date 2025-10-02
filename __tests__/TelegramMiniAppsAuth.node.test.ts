import { TelegramMiniAppsAuth } from '../nodes/TelegramMiniAppsAuth/TelegramMiniAppsAuth.node';
import { 
	generateTestInitData, 
	generateExpiredInitData,
	generateInvalidInitData,
	testUsers, 
	testBotTokens
} from './test-data';
import type { IExecuteFunctions } from 'n8n-workflow';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
	NodeOperationError: jest.fn().mockImplementation((node: unknown, message: string, context?: unknown) => {
		const error = new Error(message) as Error & { context?: unknown };
		if (context) {
			error.context = context;
		}
		return error;
	}),
}));

describe('TelegramMiniAppsAuth Node', () => {
	let node: TelegramMiniAppsAuth;
	let mockExecuteFunctions: jest.Mocked<IExecuteFunctions>;

	beforeEach(() => {
		node = new TelegramMiniAppsAuth();
		
		mockExecuteFunctions = {
			getInputData: jest.fn(),
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn(),
			getNode: jest.fn(),
			continueOnFail: jest.fn(),
		} as unknown as jest.Mocked<IExecuteFunctions>;

		jest.clearAllMocks();
		
		mockExecuteFunctions.getInputData.mockReturnValue([
			{ json: {}, pairedItem: { item: 0 } }
		]);
		mockExecuteFunctions.getCredentials.mockResolvedValue({
			botToken: testBotTokens.valid
		});
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mockExecuteFunctions.getNode.mockReturnValue({ name: 'Test Node', id: 'test', type: 'test', typeVersion: 1, position: [0, 0], parameters: {} } as any);
	});

	describe('Node description', () => {
		it('should have correct basic properties', () => {
			expect(node.description.displayName).toBe('Telegram Mini Apps Auth');
			expect(node.description.name).toBe('telegramMiniAppsAuth');
			expect(node.description.group).toEqual(['transform']);
			expect(node.description.version).toBe(1);
		});

		it('should have correct inputs and outputs', () => {
			expect(node.description.inputs).toEqual(['main']);
			expect(node.description.outputs).toEqual(['main']);
		});

		it('should require telegramApi credentials', () => {
			expect(node.description.credentials).toHaveLength(1);
			expect(node.description.credentials?.[0].name).toBe('telegramApi');
			expect(node.description.credentials?.[0].required).toBe(true);
		});

		it('should have required properties', () => {
			const properties = node.description.properties;
			expect(properties).toHaveLength(3);

			const initDataProp = properties.find(p => p.name === 'initData');
			expect(initDataProp).toBeDefined();
			expect(initDataProp?.type).toBe('string');
			expect(initDataProp?.required).toBe(true);

			const maxAgeProp = properties.find(p => p.name === 'maxAge');
			expect(maxAgeProp).toBeDefined();
			expect(maxAgeProp?.type).toBe('number');
			expect(maxAgeProp?.default).toBe(86400);
		});
	});

	describe('execute method', () => {
		it('should throw error when bot token is missing', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({});

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Bot token is required');
		});

		it('should throw error when init data is missing', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('');

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Init data is required');
		});

		it('should handle continue on fail when verification fails', async () => {
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);
			mockExecuteFunctions.getNodeParameter.mockReturnValue('invalid-data');

			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const outputData = result[0][0].json;
			expect(outputData.verified).toBe(false);
			expect(outputData.is_authenticated).toBe(false);
			expect(outputData.error).toBeDefined();
		});

		it('should successfully process valid init data', async () => {
			const validInitData = generateTestInitData(testUsers.basic, 'test-query', testBotTokens.valid);
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'initData') return validInitData;
				if (param === 'maxAge') return 86400;
				if (param === 'options') return {};
				return undefined;
			});

			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const outputData = result[0][0].json;
			expect(outputData.verified).toBe(true);
			expect(outputData.is_authenticated).toBe(true);
			expect(outputData.query_id).toBe('test-query');
			expect(outputData.user).toEqual(testUsers.basic);
			expect(outputData.user_id).toBe(testUsers.basic.id);
			expect(outputData.user_name).toBe(`${testUsers.basic.first_name} ${testUsers.basic.last_name}`);
		});

		it('should include raw data when option is enabled', async () => {
			const validInitData = generateTestInitData(testUsers.basic, 'test-query', testBotTokens.valid);
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'initData') return validInitData;
				if (param === 'maxAge') return 86400;
				if (param === 'options') return { includeRawData: true };
				return undefined;
			});

			const result = await node.execute.call(mockExecuteFunctions);
			const outputData = result[0][0].json;
			
			expect(outputData.raw_data).toBe(validInitData);
		});

		it('should include hash when option is enabled', async () => {
			const validInitData = generateTestInitData(testUsers.basic, 'test-query', testBotTokens.valid);
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'initData') return validInitData;
				if (param === 'maxAge') return 86400;
				if (param === 'options') return { includeHash: true };
				return undefined;
			});

			const result = await node.execute.call(mockExecuteFunctions);
			const outputData = result[0][0].json;
			
			expect(outputData.hash).toBeDefined();
			expect(typeof outputData.hash).toBe('string');
		});

		it('should handle user without last name', async () => {
			const validInitData = generateTestInitData(testUsers.minimal, 'test-query', testBotTokens.valid);
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'initData') return validInitData;
				if (param === 'maxAge') return 86400;
				if (param === 'options') return {};
				return undefined;
			});

			const result = await node.execute.call(mockExecuteFunctions);
			const outputData = result[0][0].json;
			
			expect(outputData.user_name).toBe(testUsers.minimal.first_name);
		});

		it('should handle multiple items', async () => {
			const validInitData1 = generateTestInitData(testUsers.basic, 'query-1', testBotTokens.valid);
			const validInitData2 = generateTestInitData(testUsers.minimal, 'query-2', testBotTokens.valid);
			
			mockExecuteFunctions.getInputData.mockReturnValue([
				{ json: {}, pairedItem: { item: 0 } },
				{ json: {}, pairedItem: { item: 1 } }
			]);
			
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, itemIndex: number) => {
				if (param === 'initData') return itemIndex === 0 ? validInitData1 : validInitData2;
				if (param === 'maxAge') return 86400;
				if (param === 'options') return {};
				return undefined;
			});

			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(2);
			
			expect(result[0][0].json.query_id).toBe('query-1');
			expect(result[0][1].json.query_id).toBe('query-2');
		});
	});

	describe('parseAndVerifyInitData method', () => {
		it('should throw error when hash is missing', () => {
			expect(() => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(TelegramMiniAppsAuth as unknown as { parseAndVerifyInitData: (data: string, token: string, maxAge: number, node: any) => any }).parseAndVerifyInitData(
					'query_id=test&user={"id":123}&auth_date=1234567890',
					testBotTokens.valid,
					86400,
					{ name: 'Test Node' }
				);
			}).toThrow('Hash is missing from init-data');
		});

		it('should throw error when user data is missing', () => {
			expect(() => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(TelegramMiniAppsAuth as unknown as { parseAndVerifyInitData: (data: string, token: string, maxAge: number, node: any) => any }).parseAndVerifyInitData(
					'query_id=test&auth_date=1234567890&hash=test-hash',
					testBotTokens.valid,
					86400,
					{ name: 'Test Node' }
				);
			}).toThrow('Invalid hash - init-data verification failed');
		});

		it('should throw error when query_id is missing', () => {
			expect(() => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(TelegramMiniAppsAuth as unknown as { parseAndVerifyInitData: (data: string, token: string, maxAge: number, node: any) => any }).parseAndVerifyInitData(
					'user={"id":123}&auth_date=1234567890&hash=test-hash',
					testBotTokens.valid,
					86400,
					{ name: 'Test Node' }
				);
			}).toThrow('Invalid hash - init-data verification failed');
		});

		it('should throw error when user data is malformed', () => {
			expect(() => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(TelegramMiniAppsAuth as unknown as { parseAndVerifyInitData: (data: string, token: string, maxAge: number, node: any) => any }).parseAndVerifyInitData(
					'query_id=test&user=invalid-json&auth_date=1234567890&hash=test-hash',
					testBotTokens.valid,
					86400,
					{ name: 'Test Node' }
				);
			}).toThrow('Invalid hash - init-data verification failed');
		});

		it('should throw error when init-data is too old', () => {
			const expiredInitData = generateExpiredInitData(testUsers.basic, testBotTokens.valid, 100000);
			
			expect(() => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(TelegramMiniAppsAuth as unknown as { parseAndVerifyInitData: (data: string, token: string, maxAge: number, node: any) => any }).parseAndVerifyInitData(
					expiredInitData,
					testBotTokens.valid,
					3600, // 1 hour max age
					{ name: 'Test Node' }
				);
			}).toThrow('Init-data is too old');
		});

		it('should throw error when hash is invalid', () => {
			const invalidInitData = generateInvalidInitData('invalid_hash');
			
			expect(() => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(TelegramMiniAppsAuth as unknown as { parseAndVerifyInitData: (data: string, token: string, maxAge: number, node: any) => any }).parseAndVerifyInitData(
					invalidInitData,
					testBotTokens.valid,
					86400,
					{ name: 'Test Node' }
				);
			}).toThrow('Invalid hash - init-data verification failed');
		});

		it('should successfully parse and verify valid init data', () => {
			const validInitData = generateTestInitData(testUsers.basic, 'test-query', testBotTokens.valid);
			
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = (TelegramMiniAppsAuth as unknown as { parseAndVerifyInitData: (data: string, token: string, maxAge: number, node: any) => any }).parseAndVerifyInitData(
				validInitData,
				testBotTokens.valid,
				86400,
				{ name: 'Test Node' }
			);
			
			expect(result.query_id).toBe('test-query');
			expect(result.user).toEqual(testUsers.basic);
			expect(result.auth_date).toBeGreaterThan(0);
			expect(result.hash).toBeDefined();
			expect(result.raw_data).toBe(validInitData);
		});
	});
});

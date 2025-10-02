import { TelegramMiniAppsAuth } from '../nodes/TelegramMiniAppsAuth/TelegramMiniAppsAuth.node';
import { testBotTokens } from './test-data';
import type { IExecuteFunctions } from 'n8n-workflow';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
	NodeOperationError: jest.fn().mockImplementation((node: any, message: string, context?: any) => {
		const error = new Error(message) as any;
		if (context) {
			error.context = context;
		}
		return error;
	}),
}));

describe('Integration Tests', () => {
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
		} as any;

		jest.clearAllMocks();
		
		mockExecuteFunctions.getInputData.mockReturnValue([
			{ json: {}, pairedItem: { item: 0 } }
		]);
		mockExecuteFunctions.getCredentials.mockResolvedValue({
			botToken: testBotTokens.valid
		});
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		mockExecuteFunctions.getNode.mockReturnValue({ name: 'Test Node' } as any);
	});

	describe('Basic integration', () => {
		it('should handle missing bot token', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({});
			mockExecuteFunctions.getNodeParameter.mockReturnValue('test-data');

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Bot token is required');
		});

		it('should handle missing init data', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('');

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Init data is required');
		});
	});

	describe('Error handling with continue on fail', () => {
		it('should return error data when continue on fail is enabled', async () => {
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
	});
});

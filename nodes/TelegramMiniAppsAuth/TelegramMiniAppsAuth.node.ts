import type {
	IDataObject,
	IExecuteFunctions,
	INode,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import * as crypto from 'crypto';

interface TelegramInitData {
	query_id: string;
	user: {
		id: number;
		first_name: string;
		last_name?: string;
		username?: string;
		language_code?: string;
		is_premium?: boolean;
	};
	auth_date: number;
	hash: string;
}

interface ParsedInitData {
	query_id: string;
	user: {
		id: number;
		first_name: string;
		last_name?: string;
		username?: string;
		language_code?: string;
		is_premium?: boolean;
	};
	auth_date: number;
	hash: string;
	raw_data: string;
}

export class TelegramMiniAppsAuth implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Telegram Mini Apps Auth',
		name: 'telegramMiniAppsAuth',
		icon: { light: 'file:telegram.svg', dark: 'file:telegram.dark.svg' },
		group: ['transform'],
		version: 1,
		description: 'Verify Telegram Mini Apps init-data and extract user information',
		defaults: {
			name: 'Telegram Mini Apps Auth',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'telegramApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Init Data',
				name: 'initData',
				type: 'string',
				default: '',
				placeholder: 'query_id=...&user=...&auth_date=...&hash=...',
				description: 'The init-data string from Telegram Mini App',
				required: true,
			},
			{
				displayName: 'Max Age (Seconds)',
				name: 'maxAge',
				type: 'number',
				default: 86400,
				description: 'Maximum age of init-data in seconds (default: 24 hours)',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Raw Data',
						name: 'includeRawData',
						type: 'boolean',
						default: false,
						description: 'Whether to include the raw init-data string in the output',
					},
					{
						displayName: 'Include Hash',
						name: 'includeHash',
						type: 'boolean',
						default: false,
						description: 'Whether to include the hash in the output',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('telegramApi');
		if (!credentials?.botToken) {
			throw new NodeOperationError(this.getNode(), 'Bot token is required');
		}

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const initData = this.getNodeParameter('initData', itemIndex, '') as string;
				const maxAge = this.getNodeParameter('maxAge', itemIndex, 86400) as number;
				const options = this.getNodeParameter('options', itemIndex, {}) as {
					includeRawData?: boolean;
					includeHash?: boolean;
				};

				if (!initData) {
					throw new NodeOperationError(this.getNode(), 'Init data is required', {
						itemIndex,
					});
				}

			// Parse and verify init-data
			const parsedData = TelegramMiniAppsAuth.parseAndVerifyInitData(
				initData,
				credentials.botToken as string,
				maxAge,
				this.getNode(),
			);

			// Prepare output data
			const outputData: IDataObject = {
					verified: true,
					query_id: parsedData.query_id,
					user: parsedData.user,
					auth_date: parsedData.auth_date,
				};

				if (options.includeRawData) {
					outputData.raw_data = parsedData.raw_data;
				}

				if (options.includeHash) {
					outputData.hash = parsedData.hash;
				}

				// Add additional computed fields
				outputData.user_id = parsedData.user.id;
				outputData.user_name = parsedData.user.first_name + 
					(parsedData.user.last_name ? ` ${parsedData.user.last_name}` : '');
				outputData.is_authenticated = true;

				returnData.push({
					json: outputData,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							verified: false,
							error: error.message,
							is_authenticated: false,
						},
						pairedItem: { item: itemIndex },
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}

	private static parseAndVerifyInitData(
		initData: string,
		botToken: string,
		maxAge: number,
		node: INode,
	): ParsedInitData {
		// Parse URL-encoded init-data
		const params = new URLSearchParams(initData);
		const hash = params.get('hash');
		
		if (!hash) {
			throw new NodeOperationError(node, 'Hash is missing from init-data');
		}

		// Remove hash from params for verification
		params.delete('hash');
		
		// Sort parameters alphabetically
		const entries: [string, string][] = [];
		params.forEach((value, key) => {
			entries.push([key, value]);
		});
		const sortedParams = entries
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([key, value]) => `${key}=${value}`)
			.join('\n');

		// Create secret key
		const secretKey = crypto
			.createHmac('sha256', 'WebAppData')
			.update(botToken)
			.digest();

		// Calculate hash
		const calculatedHash = crypto
			.createHmac('sha256', secretKey)
			.update(sortedParams)
			.digest('hex');

		// Verify hash
		if (calculatedHash !== hash) {
			throw new NodeOperationError(node, 'Invalid hash - init-data verification failed');
		}

		// Parse user data
		const userParam = params.get('user');
		if (!userParam) {
			throw new NodeOperationError(node, 'User data is missing from init-data');
		}

		let user: TelegramInitData['user'];
		try {
			user = JSON.parse(userParam);
		} catch {
			throw new NodeOperationError(node, 'Invalid user data format');
		}

		// Check auth_date
		const authDate = parseInt(params.get('auth_date') || '0', 10);
		const currentTime = Math.floor(Date.now() / 1000);
		
		if (currentTime - authDate > maxAge) {
			throw new NodeOperationError(node, `Init-data is too old (max age: ${maxAge} seconds)`);
		}

		// Get query_id
		const queryId = params.get('query_id');
		if (!queryId) {
			throw new NodeOperationError(node, 'Query ID is missing from init-data');
		}

		return {
			query_id: queryId,
			user,
			auth_date: authDate,
			hash,
			raw_data: initData,
		};
	}
}

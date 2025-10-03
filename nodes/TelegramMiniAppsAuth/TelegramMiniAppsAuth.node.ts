import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { validate, parse } from '@telegram-apps/init-data-node';

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
		if (!credentials?.accessToken) {
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

				await validate(initData, credentials.accessToken as string, {
					expiresIn: maxAge,
				});
				const parsedData = await parse(initData);

				// Prepare output data
				const outputData: IDataObject = {
					verified: true,
					query_id: parsedData.query_id,
					user: parsedData.user,
					auth_date: parsedData.auth_date,
				};

				if (options.includeHash) {
					outputData.hash = parsedData.hash;
				}

				// Add additional computed fields
				outputData.user_id = parsedData.user?.id;
				outputData.user_name = parsedData.user?.first_name +
					(parsedData.user?.last_name ? ` ${parsedData.user.last_name}` : '');
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

}

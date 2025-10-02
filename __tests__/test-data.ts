import * as crypto from 'crypto';

export interface TestUser {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
	language_code?: string;
	is_premium?: boolean;
}

export interface TestInitData {
	query_id: string;
	user: TestUser;
	auth_date: number;
	hash: string;
}

/**
 * Generate valid init-data for testing
 */
export function generateTestInitData(
	user: TestUser,
	queryId: string = 'AAHdF6IQAAAAAN0XohDhrOrc',
	botToken: string = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
	authDate?: number
): string {
	const auth_date = authDate || Math.floor(Date.now() / 1000);
	const userJson = JSON.stringify(user);
	
	// Create URLSearchParams
	const params = new URLSearchParams();
	params.set('query_id', queryId);
	params.set('user', userJson);
	params.set('auth_date', auth_date.toString());
	
	// Generate hash
	const sortedParams = Array.from(params.entries())
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');
	
	const secretKey = crypto
		.createHmac('sha256', 'WebAppData')
		.update(botToken)
		.digest();
	
	const hash = crypto
		.createHmac('sha256', secretKey)
		.update(sortedParams)
		.digest('hex');
	
	params.set('hash', hash);
	
	return params.toString();
}

/**
 * Generate invalid init-data for testing error cases
 */
export function generateInvalidInitData(type: 'missing_hash' | 'invalid_hash' | 'malformed_user' | 'missing_query_id'): string {
	const user = { id: 123, first_name: 'Test' };
	const userJson = type === 'malformed_user' ? 'invalid-json' : JSON.stringify(user);
	
	const params = new URLSearchParams();
	
	if (type !== 'missing_query_id') {
		params.set('query_id', 'test-query-id');
	}
	
	params.set('user', userJson);
	params.set('auth_date', Math.floor(Date.now() / 1000).toString());
	
	if (type !== 'missing_hash') {
		params.set('hash', type === 'invalid_hash' ? 'invalid-hash' : 'valid-hash');
	}
	
	return params.toString();
}

/**
 * Generate expired init-data
 */
export function generateExpiredInitData(
	user: TestUser,
	botToken: string = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
	ageInSeconds: number = 100000
): string {
	const authDate = Math.floor(Date.now() / 1000) - ageInSeconds;
	return generateTestInitData(user, 'expired-query', botToken, authDate);
}

/**
 * Test users for different scenarios
 */
export const testUsers = {
	basic: {
		id: 279058397,
		first_name: 'Vladislav',
		last_name: 'Kibenko',
		username: 'vdkfrost',
		language_code: 'ru'
	} as TestUser,
	
	minimal: {
		id: 123456789,
		first_name: 'John'
	} as TestUser,
	
	premium: {
		id: 987654321,
		first_name: 'Alice',
		last_name: 'Smith',
		username: 'alice_smith',
		language_code: 'en',
		is_premium: true
	} as TestUser,
	
	unicode: {
		id: 555666777,
		first_name: 'Алексей',
		last_name: 'Петров',
		username: 'alexey_petrov',
		language_code: 'ru'
	} as TestUser
};

/**
 * Valid test init-data strings
 */
export const validTestInitData = {
	basic: generateTestInitData(testUsers.basic),
	minimal: generateTestInitData(testUsers.minimal),
	premium: generateTestInitData(testUsers.premium),
	unicode: generateTestInitData(testUsers.unicode)
};

/**
 * Invalid test init-data strings
 */
export const invalidTestInitData = {
	missingHash: generateInvalidInitData('missing_hash'),
	invalidHash: generateInvalidInitData('invalid_hash'),
	malformedUser: generateInvalidInitData('malformed_user'),
	missingQueryId: generateInvalidInitData('missing_query_id'),
	expired: generateExpiredInitData(testUsers.basic)
};

/**
 * Bot tokens for testing
 */
export const testBotTokens = {
	valid: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
	invalid: 'invalid-token',
	empty: ''
};

/**
 * Expected output data for valid init-data
 */
export const expectedOutputs = {
	basic: {
		verified: true,
		query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
		user: testUsers.basic,
		auth_date: expect.any(Number),
		user_id: testUsers.basic.id,
		user_name: `${testUsers.basic.first_name} ${testUsers.basic.last_name}`,
		is_authenticated: true
	},
	
	minimal: {
		verified: true,
		query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
		user: testUsers.minimal,
		auth_date: expect.any(Number),
		user_id: testUsers.minimal.id,
		user_name: testUsers.minimal.first_name,
		is_authenticated: true
	}
};

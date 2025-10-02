// Global test setup
import { expect } from '@jest/globals';

// Mock console methods to reduce noise in tests
global.console = {
	...console,
	// Uncomment to ignore a specific log level
	// log: jest.fn(),
	// debug: jest.fn(),
	// info: jest.fn(),
	// warn: jest.fn(),
	// error: jest.fn(),
};

// Global test utilities
declare global {
	namespace jest {
		interface Matchers<R> {
			toBeValidTelegramUser(): R;
		}
	}
}

// Custom matcher for Telegram user validation
expect.extend({
	toBeValidTelegramUser(received: any) {
		const pass = 
			received &&
			typeof received === 'object' &&
			typeof received.id === 'number' &&
			typeof received.first_name === 'string' &&
			received.first_name.length > 0;

		if (pass) {
			return {
				message: () => `expected ${received} not to be a valid Telegram user`,
				pass: true,
			};
		} else {
			return {
				message: () => `expected ${received} to be a valid Telegram user with id (number) and first_name (string)`,
				pass: false,
			};
		}
	},
});

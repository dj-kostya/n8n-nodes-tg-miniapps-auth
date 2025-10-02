# Contributing to n8n-nodes-tg-miniapps-auth

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites
- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Git

### Installation
```bash
git clone https://github.com/dj-kostya/n8n-nodes-tg-miniapps-auth.git
cd n8n-nodes-tg-miniapps-auth
npm install
```

### Development Commands
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for CI
npm run test:ci

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Build project
npm run build

# Start development server
npm run dev
```

## Testing

### Running Tests
We use Jest for testing. All tests should pass before submitting a pull request.

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Test Coverage
We maintain high test coverage (90%+). New features should include comprehensive tests.

### Writing Tests
- Place tests in `__tests__` directories
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

## Code Style

### Linting
We use ESLint for code quality. Run `npm run lint` to check for issues.

### Formatting
We use Prettier for code formatting. Run `npm run lint:fix` to auto-fix issues.

### TypeScript
- Use strict TypeScript settings
- Add proper type annotations
- Avoid `any` types when possible

## Pull Request Process

### Before Submitting
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Run linting and fix any issues

### Pull Request Checklist
- [ ] Tests are added/updated
- [ ] All tests pass
- [ ] Code is properly linted
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] PR description is detailed

### Commit Messages
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Issue Reporting

### Bug Reports
Use the bug report template and include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Error logs if applicable

### Feature Requests
Use the feature request template and include:
- Clear description of the feature
- Use case and motivation
- Implementation ideas if any
- Additional context

## Security

### Reporting Security Issues
Please do not report security vulnerabilities through public GitHub issues. Instead, please email security@example.com.

### Security Audit
We run security audits as part of our CI process. If you find security issues, please report them privately.

## Release Process

### Versioning
We follow semantic versioning (SemVer):
- `MAJOR`: Breaking changes
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes (backward compatible)

### Release Workflow
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag
4. Push tag to trigger release workflow
5. GitHub Actions will handle npm publishing

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

### Unacceptable Behavior
- Harassment, trolling, or discriminatory language
- Personal attacks or political discussions
- Spam or excessive self-promotion
- Any other unprofessional conduct

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, please:
1. Check existing issues and discussions
2. Create a new issue with the "question" label
3. Contact maintainers directly if needed

Thank you for contributing! 🎉

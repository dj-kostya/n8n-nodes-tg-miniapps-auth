# GitHub Actions

This directory contains GitHub Actions workflows for automated CI/CD processes.

## Workflows

### CI (`ci.yml`)
Runs on every push and pull request to main/develop branches.

**Features:**
- Tests on Node.js 18.x and 20.x
- Linting with ESLint
- Unit tests with Jest
- Coverage reporting
- Security audit
- Build verification

**Jobs:**
- `test`: Runs tests on multiple Node.js versions
- `build`: Verifies the build process
- `security`: Performs security audit

### Release (`release.yml`)
Runs when a new tag is pushed (e.g., `v1.0.0`).

**Features:**
- Automatic npm publishing
- GitHub release creation
- Asset upload

**Requirements:**
- `NPM_TOKEN` secret must be configured
- Tags must follow semantic versioning (v*)

### Dependencies (`dependencies.yml`)
Runs weekly (Mondays at 9:00 UTC) or manually.

**Features:**
- Checks for outdated packages
- Updates dependencies
- Creates pull request with updates
- Runs tests after updates

## Secrets

Configure the following secrets in your repository settings:

- `NPM_TOKEN`: npm authentication token for publishing
- `GITHUB_TOKEN`: Automatically provided by GitHub

## Templates

### Issue Templates
- Bug report template
- Feature request template

### Pull Request Template
- Comprehensive checklist for contributors
- Automated testing requirements

## Coverage

Code coverage is tracked using Codecov with the following targets:
- Project coverage: 90%
- Patch coverage: 80%

Coverage reports are generated for every CI run and uploaded to Codecov.

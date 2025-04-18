# Testing Guide

This project uses Vitest for unit testing and Playwright for E2E testing.

## Unit Testing with Vitest

Unit tests are located in the same directory as the code they test with a `.test.ts` or `.spec.ts` extension. Example test files can be found in `src/test/examples/`.

### Running Unit Tests

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Writing Unit Tests

- Follow the Arrange-Act-Assert pattern
- Use `describe` blocks to group related tests
- Use `it` or `test` for individual test cases
- Leverage test doubles from the `vi` object for mocks and spies
- Use testing-library for testing React components

## E2E Testing with Playwright

E2E tests are located in the `e2e` directory at the root of the project. Page objects are in the `e2e/pages` directory.

### Running E2E Tests

```bash
# Install Playwright browsers (only needed once)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Writing E2E Tests

- Use the Page Object Model pattern for maintainable tests
- Keep tests isolated and independent
- Use Playwright's built-in assertions
- Leverage visual testing with `expect(page).toHaveScreenshot()`

## Best Practices

- Test behavior, not implementation details
- Write meaningful test descriptions
- Keep tests small and focused
- Ensure test isolation
- Follow the testing guidelines in the codebase rules 
import { test as base, TestInfo } from '@playwright/test'
import { langfuseTestHelper } from './langfuseTestHelper'

// Extend the test type with Langfuse helper
type TestFixtures = {
  langfuse: typeof langfuseTestHelper
}

// Create a custom test with Langfuse integration
export const test = base.extend<TestFixtures>({
  langfuse: async ({}, use, testInfo: TestInfo) => {
    // Start tracking the test
    await langfuseTestHelper.startTestTrace(testInfo)

    // Provide the helper to the test
    await use(langfuseTestHelper)

    // Cleanup will be handled in the test hooks
  },
})

// Export the base test for cases where Langfuse is not needed
export { expect } from '@playwright/test'

// Add global test hooks for automatic Langfuse integration
test.beforeEach(async ({ langfuse }, testInfo: TestInfo) => {
  // Additional setup if needed
  await langfuse.trackStep('test-setup', { testInfo: testInfo.title })
})

test.afterEach(async ({ langfuse }, testInfo: TestInfo) => {
  // Track test completion
  const status = testInfo.status
  const error = testInfo.error

  await langfuse.endTestTrace(
    testInfo,
    status as 'passed' | 'failed' | 'skipped',
    error ? new Error(error.message) : undefined
  )
})

// Export a function to create tests with automatic Langfuse integration
export function createLangfuseTest() {
  return test
}

// Export the helper for direct use
export { langfuseTestHelper }

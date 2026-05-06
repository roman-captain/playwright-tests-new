import { Langfuse } from 'langfuse'
import { config } from 'dotenv'
import { TestInfo } from '@playwright/test'

config()

export class LangfuseTestHelper {
  private langfuse: Langfuse
  private currentTrace: any
  private testStartTime: number = 0

  constructor() {
    this.langfuse = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
      secretKey: process.env.LANGFUSE_SECRET_KEY!,
    })
  }

  /**
   * Start tracking a test execution
   */
  async startTestTrace(
    testInfo: TestInfo,
    additionalMetadata?: Record<string, any>
  ) {
    this.testStartTime = Date.now()

    this.currentTrace = this.langfuse.trace({
      name: testInfo.title,
      userId: 'qa-automation',
      metadata: {
        testFile: testInfo.file,
        testLine: testInfo.line,
        testColumn: testInfo.column,
        testPath: testInfo.titlePath.join(' > '),
        tags: testInfo.tags,
        project: process.env.ENV || 'staging',
        browser: testInfo.project.name,
        ...additionalMetadata,
      },
    })

    // Log test start
    this.currentTrace.span({
      name: 'test-start',
      input: { testName: testInfo.title },
    })

    return this.currentTrace
  }

  /**
   * Track a test step or action
   */
  async trackStep(
    stepName: string,
    input?: any,
    output?: any,
    metadata?: Record<string, any>
  ) {
    if (!this.currentTrace) return

    const span = this.currentTrace.span({
      name: stepName,
      input,
      output,
      metadata,
    })

    return span
  }

  /**
   * Track API requests
   */
  async trackApiRequest(
    method: string,
    url: string,
    requestBody?: any,
    responseBody?: any,
    statusCode?: number,
    responseTime?: number
  ) {
    if (!this.currentTrace) return

    const span = this.currentTrace.span({
      name: `api-${method.toLowerCase()}`,
      input: {
        method,
        url,
        body: requestBody,
      },
      output: {
        statusCode,
        body: responseBody,
        responseTime,
      },
      metadata: {
        type: 'api-request',
      },
    })

    return span
  }

  /**
   * Track page navigation
   */
  async trackPageNavigation(url: string, title?: string, loadTime?: number) {
    if (!this.currentTrace) return

    const span = this.currentTrace.span({
      name: 'page-navigation',
      input: { url },
      output: { title, loadTime },
      metadata: {
        type: 'navigation',
      },
    })

    return span
  }

  /**
   * Track form interactions
   */
  async trackFormInteraction(
    action: string,
    fieldName: string,
    value?: any,
    success?: boolean
  ) {
    if (!this.currentTrace) return

    const span = this.currentTrace.span({
      name: `form-${action}`,
      input: { fieldName, value },
      output: { success },
      metadata: {
        type: 'form-interaction',
        action,
      },
    })

    return span
  }

  /**
   * Track assertions
   */
  async trackAssertion(
    assertionName: string,
    expected: any,
    actual: any,
    passed: boolean
  ) {
    if (!this.currentTrace) return

    const span = this.currentTrace.span({
      name: `assertion-${assertionName}`,
      input: { expected },
      output: { actual, passed },
      metadata: {
        type: 'assertion',
      },
    })

    return span
  }

  /**
   * Track test completion with results
   */
  async endTestTrace(
    testInfo: TestInfo,
    status: 'passed' | 'failed' | 'skipped',
    error?: Error
  ) {
    if (!this.currentTrace) return

    const testDuration = Date.now() - this.testStartTime

    // Log test end
    this.currentTrace.span({
      name: 'test-end',
      input: {
        status,
        duration: testDuration,
        error: error?.message,
        stack: error?.stack,
      },
    })

    // Score the test based on status
    this.currentTrace.score({
      name: 'test-success',
      value: status === 'passed' ? 1 : 0,
    })

    // Score based on performance (if test passed)
    if (status === 'passed') {
      const performanceScore = this.calculatePerformanceScore(testDuration)
      this.currentTrace.score({
        name: 'test-performance',
        value: performanceScore,
      })
    }

    // LLM-judge: automatically evaluate failed tests
    if (status === 'failed' && error) {
      await this.evaluateWithLLM(testInfo.title, error)
    }

    await this.currentTrace.update({
      metadata: {
        ...this.currentTrace.metadata,
        status,
        duration: testDuration,
        error: error?.message,
      },
    })

    await this.langfuse.flushAsync()
  }

  /**
   * Call Gemini API to classify test failure as real bug or test issue
   */
  private async evaluateWithLLM(testName: string, error: Error): Promise<void> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return

    const prompt = `Test: "${testName}". Error: "${error.message.slice(0, 200)}". Reply ONLY: "score: 1" if real bug or "score: 0" if test issue.`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      )

      const data = await response.json() as any
      const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      const scoreMatch = text.match(/score[:\s]+([01])/i)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0

      this.currentTrace.score({
        name: 'llm-bug-detector',
        value: score,
        comment: text.slice(0, 500),
      })
    } catch {
      // Silent fail — LLM evaluation should never break the test run
    }
  }

  /**
   * Calculate performance score based on test duration
   */
  private calculatePerformanceScore(duration: number): number {
    // Score based on duration thresholds
    if (duration < 5000) return 1.0 // Excellent: < 5s
    if (duration < 10000) return 0.8 // Good: 5-10s
    if (duration < 30000) return 0.6 // Acceptable: 10-30s
    if (duration < 60000) return 0.4 // Slow: 30-60s
    return 0.2 // Very slow: > 60s
  }

  /**
   * Track custom events
   */
  async trackEvent(
    eventName: string,
    data?: any,
    metadata?: Record<string, any>
  ) {
    if (!this.currentTrace) return

    const span = this.currentTrace.span({
      name: eventName,
      input: data,
      metadata,
    })

    return span
  }

  /**
   * Get current trace for direct access
   */
  getCurrentTrace() {
    return this.currentTrace
  }
}

// Singleton instance
export const langfuseTestHelper = new LangfuseTestHelper()

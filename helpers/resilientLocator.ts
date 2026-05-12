import { type Page, type Locator } from '@playwright/test'

export type SelectorStrategy = {
  type: 'css' | 'text' | 'role' | 'placeholder' | 'label' | 'xpath'
  value: string
  name?: string
}

export class ResilientLocator {
  private page: Page
  private elementName: string
  private strategies: SelectorStrategy[]

  constructor(page: Page, elementName: string, strategies: SelectorStrategy[]) {
    this.page = page
    this.elementName = elementName
    this.strategies = strategies
  }

  async find(timeout = 5000): Promise<Locator> {
    for (let i = 0; i < this.strategies.length; i++) {
      const strategy = this.strategies[i]
      try {
        const locator = this.buildLocator(strategy)
        await locator.waitFor({ state: 'visible', timeout })

        if (i === 0) {
          console.log(`✅ [ResilientLocator] "${this.elementName}" — primary OK: ${strategy.type}("${strategy.value}")`)
        } else {
          console.warn(`⚠️  [ResilientLocator] "${this.elementName}" — primary broken! Recovered via fallback #${i}: ${strategy.type}("${strategy.value}"). Please update the selector.`)
        }

        return locator
      } catch {
        console.warn(`❌ [ResilientLocator] "${this.elementName}" — strategy #${i} failed: ${strategy.type}("${strategy.value}")`)
      }
    }

    throw new Error(
      `[ResilientLocator] All ${this.strategies.length} strategies failed for "${this.elementName}". Element not found.`
    )
  }

  private buildLocator(strategy: SelectorStrategy): Locator {
    switch (strategy.type) {
      case 'css': return this.page.locator(strategy.value)
      case 'xpath': return this.page.locator(`xpath=${strategy.value}`)
      case 'text': return this.page.getByText(strategy.value, { exact: true })
      case 'placeholder': return this.page.getByPlaceholder(strategy.value)
      case 'label': return this.page.getByLabel(strategy.value)
      case 'role': return this.page.getByRole(strategy.value as any, { name: strategy.name })
      default: throw new Error(`[ResilientLocator] Unknown strategy type: ${strategy.type}`)
    }
  }
}

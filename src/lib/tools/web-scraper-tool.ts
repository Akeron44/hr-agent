import { Tool } from '../agents/base-agent'
import * as cheerio from 'cheerio'


export class WebScraperTool implements Tool {
  name = 'web_scraper'

  async execute(url: string): Promise<string> {
    try {
      console.log(`🕷️ Web Scraper: Fetching content from ${url}`)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      $('script, style, nav, header, footer, aside, .sidebar, #sidebar, .navigation').remove()

      let content = ''

      const jobSelectors = [
        '.job-description',
        '.job-details',
        '.job-content',
        '.posting-content',
        '.job-posting',
        '.job-info',
        '.description',
        '.requirements', 
        '.qualifications',
        '.responsibilities',
        '[data-testid="job-details"]',
        '[data-testid="jobsearch-JobComponent"]',
        '.jobs-description',
        '.jobs-details'
      ]

      for (const selector of jobSelectors) {
        const element = $(selector)
        if (element.length > 0) {
          content += element.text().trim() + '\n\n'
        }
      }

      if (content.length < 200) {
        const mainSelectors = [
          'main',
          '.main-content',
          '.content',
          '.container',
          'article',
          '.post-content',
          '.entry-content'
        ]

        for (const selector of mainSelectors) {
          const element = $(selector)
          if (element.length > 0) {
            content += element.text().trim() + '\n\n'
            break
          }
        }
      }

      if (content.length < 200) {
        content = $('body').text().trim()
      }

      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim()

      if (content.length > 15000) {
        content = content.substring(0, 15000) + '...'
      }

      console.log(`✅ Web Scraper: Extracted ${content.length} characters from ${url}`)
      return content

    } catch (error) {
      console.error('❌ Web Scraper error:', error)
      throw new Error(`Failed to scrape content from URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
} 
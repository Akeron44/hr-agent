import { OpenAI } from 'openai'

export interface Tool {
  name: string
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute(...args: any[]): Promise<any>
}

export abstract class BaseAgent {
  protected openai: OpenAI
  protected tools: Map<string, Tool> = new Map()
  
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

    protected addTool(tool: Tool) {
      this.tools.set(tool.name, tool)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected async useTool(toolName: string, ...args: any[]) {
      const tool = this.tools.get(toolName)
      if (!tool) {
        throw new Error(`Tool ${toolName} not available`)
      }
      return await tool.execute(...args)
    }
  
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract execute(...args: any[]): Promise<any>
}

import { Tool } from "../agents/base-agent"
import { processFiles } from "../services/file-processing-service"

export class FileProcessorTool implements Tool {
  name = 'file_processor'

  async execute(description: string, files: Array<{ name: string; base64Data: string }>): Promise<string> {
    return await processFiles(description, files)
  }
}
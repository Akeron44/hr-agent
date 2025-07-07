import ConvertAPI from 'convertapi'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const convertApi = new ConvertAPI(process.env.CONVERT_API_TOKEN!)

export async function processFiles(
  candidateDescription: string, 
  files: Array<{ name: string; base64Data: string }>
): Promise<string> {
  let combinedText = candidateDescription + '\n\n'
  
  for (const file of files) {
    try {
      console.log(`📄 Processing ${files.length} file${files.length > 1 ? 's' : ''}...`)
      console.log(`📄 Processing file: ${file.name}...`);
      const buffer = Buffer.from(file.base64Data, 'base64')
      
      const tempDir = os.tmpdir()
      const tempFilePath = path.join(tempDir, file.name)
      await fs.writeFile(tempFilePath, buffer)
      
      const convertedResults = await convertApi.convert('txt', { File: tempFilePath }, 'pdf')
      const response = await fetch(convertedResults.file.url)
      const parsedText = await response.text()
      
      combinedText += `\n--- Content of ${file.name} ---\n${parsedText}\n\n`
      
      await fs.unlink(tempFilePath)
      
      console.log(`✅ Successfully processed ${file.name}`)
      
    } catch (error) {
      console.error(`❌ Error processing file ${file.name}:`, error)
      combinedText += `\n--- Error reading ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'} ---\n\n`
    }
  }
  
  return combinedText
}
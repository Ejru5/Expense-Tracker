import { DEFAULT_CATEGORIES } from '../types'
import type { ReceiptScanResponse } from '../types'
export type { ReceiptScanResponse }

interface ParseResponse {
  amount: number
  type: 'expense' | 'income'
  categoryId: string
  merchant?: string
  note?: string
  date?: string
}

export async function parseExpenseTextClient(text: string, apiKey: string): Promise<ParseResponse> {
  const categoriesList = DEFAULT_CATEGORIES.map(c => `${c.id} (${c.name})`).join(', ')

  const prompt = `You are a financial assistant parsing household transactions.
Parse the following description: "${text}"

Match it to one of these category IDs:
${categoriesList}

Respond ONLY with a JSON object following this schema. Do not write markdown blocks or any other explanation.
{
  "amount": number (positive value),
  "type": "expense" | "income",
  "categoryId": "matched_category_id_or_other",
  "merchant": "merchant_name_if_detectable" (optional),
  "note": "brief_description_excluding_merchant_and_amount" (optional),
  "date": "YYYY-MM-DD" (optional, defaults to current date if mentioned, otherwise omit)
}`

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Mistral API error: ${response.status} - ${errorBody}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from Mistral AI')

  return JSON.parse(content) as ParseResponse
}

export async function parseExpenseText(text: string): Promise<ParseResponse> {
  // Try functions endpoint if configured to use functions, otherwise fallback to local client key
  const useFunctions = import.meta.env.VITE_USE_FUNCTIONS === 'true'
  
  if (useFunctions) {
    // Calling the Firebase Cloud Function
    const response = await fetch('/api/parseExpenseText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) {
      throw new Error(`Cloud Function error: ${response.statusText}`)
    }
    return await response.json() as ParseResponse
  } else {
    // Fallback to local API key for development/local testing
    const apiKey = localStorage.getItem('mistral_api_key') || import.meta.env.VITE_MISTRAL_API_KEY
    if (!apiKey) {
      throw new Error('Mistral API Key is missing. Please add it in Profile settings or set VITE_MISTRAL_API_KEY in .env')
    }
    return parseExpenseTextClient(text, apiKey)
  }
}



export async function scanReceiptImageClient(base64Image: string, apiKey: string): Promise<ReceiptScanResponse> {
  const categoriesList = DEFAULT_CATEGORIES.map(c => `${c.id} (${c.name})`).join(', ')

  const prompt = `You are a receipt scanning AI. Analyze the uploaded receipt image.
Extract the merchant name, date, line items (item name and item total price), tax amount, and the overall total.
Match the receipt to one of these category IDs:
${categoriesList}

Ensure the output matches the required JSON schema strictly.`

  const schema = {
    type: "object",
    properties: {
      merchant: { type: "string", description: "Name of the store or restaurant" },
      date: { type: "string", description: "Date in YYYY-MM-DD format" },
      lineItems: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the item" },
            amount: { type: "number", description: "Total price of the item" }
          },
          required: ["name", "amount"]
        }
      },
      tax: { type: "number", description: "Tax amount" },
      total: { type: "number", description: "Total amount on the receipt" },
      categoryId: { type: "string", description: "Best matching category ID" }
    },
    required: ["merchant", "date", "lineItems", "tax", "total", "categoryId"]
  }

  // Mistral Document AI OCR API call
  const response = await fetch('https://api.mistral.ai/v1/ocr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      document: {
        type: "document_url",
        document_url: base64Image
      },
      document_annotation_prompt: prompt,
      document_annotation_format: {
        type: "json_schema",
        schema: schema
      }
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    // Fallback: If OCR API is not fully configured, try calling standard chat completion with image messages
    // using pixtral-12b-2409 model. This ensures it works on all tiers!
    try {
      return await scanReceiptImageFallback(base64Image, apiKey, prompt)
    } catch (fallbackErr) {
      throw new Error(`OCR API failed: ${response.status} - ${errorBody}. Fallback also failed: ${(fallbackErr as any).message || fallbackErr}`)
    }
  }

  const data = await response.json()
  // Extract output from document annotation
  const annotationContent = data.pages?.[0]?.document_annotation?.content
  if (!annotationContent) {
    // If no annotation found, try fallback
    return await scanReceiptImageFallback(base64Image, apiKey, prompt)
  }

  return JSON.parse(annotationContent) as ReceiptScanResponse
}

async function scanReceiptImageFallback(base64Image: string, apiKey: string, prompt: string): Promise<ReceiptScanResponse> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'pixtral-12b-2409', // mistral vision model
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: base64Image } }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Mistral Vision API error: ${response.status} - ${errorBody}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from Mistral Vision')
  return JSON.parse(content) as ReceiptScanResponse
}

export async function scanReceiptImage(base64Image: string): Promise<ReceiptScanResponse> {
  const useFunctions = import.meta.env.VITE_USE_FUNCTIONS === 'true'

  if (useFunctions) {
    const response = await fetch('/api/scanReceipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    })
    if (!response.ok) {
      throw new Error(`Cloud Function error: ${response.statusText}`)
    }
    return await response.json() as ReceiptScanResponse
  } else {
    const apiKey = localStorage.getItem('mistral_api_key') || import.meta.env.VITE_MISTRAL_API_KEY
    if (!apiKey) {
      throw new Error('Mistral API Key is missing. Please add it in Profile settings or set VITE_MISTRAL_API_KEY in .env')
    }
    return scanReceiptImageClient(base64Image, apiKey)
  }
}

export async function generateSpendingInsightClient(summary: any, apiKey: string): Promise<string> {
  const prompt = `You are a financial planning bot. Analyze this budget summary for the household:
${JSON.stringify(summary)}

Provide a concise, friendly, 1-2 sentence actionable spending insight or warning warning (like a nudge) to keep them on track. Keep it under 150 characters if possible.
Output JSON format:
{
  "nudge": "nudge text string"
}`

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Mistral API error: ${response.status} - ${errorBody}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from Mistral AI')
  const json = JSON.parse(content)
  return json.nudge || 'Keep tracking your expenses to find savings opportunities!'
}

export async function getSpendingInsight(summary: any): Promise<string> {
  const useFunctions = import.meta.env.VITE_USE_FUNCTIONS === 'true'

  if (useFunctions) {
    const response = await fetch('/api/generateSpendingInsight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary }),
    })
    if (!response.ok) {
      throw new Error(`Cloud Function error: ${response.statusText}`)
    }
    const json = await response.json()
    return json.nudge
  } else {
    const apiKey = localStorage.getItem('mistral_api_key') || import.meta.env.VITE_MISTRAL_API_KEY
    if (!apiKey) {
      // Graceful fallback if API key is not entered
      return 'Add a Mistral API key in Profile to enable smart AI spending insights.'
    }
    try {
      return await generateSpendingInsightClient(summary, apiKey)
    } catch (err) {
      console.error(err)
      return 'Unable to load spending insights right now.'
    }
  }
}



const { onRequest } = require('firebase-functions/v2/https')
const logger = require('firebase-functions/logger')

// Firebase Cloud Function to proxy Mistral API requests securely
// Run: firebase functions:config:set mistral.key="YOUR_KEY" to set key in v1, or use Secret Manager in v2.
// This onRequest endpoint accepts { text: string } and calls Mistral AI.

exports.parseExpenseText = onRequest({ cors: true }, async (req, res) => {
  try {
    const text = req.body.text
    if (!text) {
      res.status(400).send({ error: 'Missing text parameter' })
      return
    }

    const mistralKey = process.env.MISTRAL_API_KEY || (global.process.env.FUNCTIONS_EMULATOR ? 'dummy-key' : null)
    if (!mistralKey) {
      res.status(500).send({ error: 'Mistral API key is not configured on Firebase Cloud Functions' })
      return
    }

    const categoriesList = [
      'food (Food)', 'transport (Transport)', 'rent (Rent)', 'utilities (Utilities)',
      'entertainment (Entertainment)', 'health (Health)', 'shopping (Shopping)',
      'groceries (Groceries)', 'travel (Travel)', 'education (Education)',
      'personal (Personal Care)', 'other (Other)'
    ].join(', ')

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
  "date": "YYYY-MM-DD" (optional)
}`

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mistralKey}`,
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
      res.status(response.status).send({ error: `Mistral API error: ${errorBody}` })
      return
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    res.status(200).send(JSON.parse(content))
  } catch (error) {
    logger.error('Error parsing text:', error)
    res.status(500).send({ error: error.message })
  }
})

exports.scanReceipt = onRequest({ cors: true }, async (req, res) => {
  try {
    const image = req.body.image // base64 data URL
    if (!image) {
      res.status(400).send({ error: 'Missing image parameter' })
      return
    }

    const mistralKey = process.env.MISTRAL_API_KEY
    if (!mistralKey) {
      res.status(500).send({ error: 'Mistral API key is not configured on Firebase Cloud Functions' })
      return
    }

    const categoriesList = [
      'food (Food)', 'transport (Transport)', 'rent (Rent)', 'utilities (Utilities)',
      'entertainment (Entertainment)', 'health (Health)', 'shopping (Shopping)',
      'groceries (Groceries)', 'travel (Travel)', 'education (Education)',
      'personal (Personal Care)', 'other (Other)'
    ].join(', ')

    const prompt = `You are a receipt scanning AI. Analyze the uploaded receipt image.
Extract the merchant name, date, line items (item name and item total price), tax amount, and the overall total.
Match the receipt to one of these category IDs:
${categoriesList}

Ensure the output matches the required JSON schema strictly.`

    const schema = {
      type: "object",
      properties: {
        merchant: { type: "string" },
        date: { type: "string" },
        lineItems: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              amount: { type: "number" }
            },
            required: ["name", "amount"]
          }
        },
        tax: { type: "number" },
        total: { type: "number" },
        categoryId: { type: "string" }
      },
      required: ["merchant", "date", "lineItems", "tax", "total", "categoryId"]
    }

    // Try OCR endpoint
    const response = await fetch('https://api.mistral.ai/v1/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mistralKey}`,
      },
      body: JSON.stringify({
        document: {
          type: "document_url",
          document_url: image
        },
        document_annotation_prompt: prompt,
        document_annotation_format: {
          type: "json_schema",
          schema: schema
        }
      }),
    })

    if (!response.ok) {
      // Fallback to vision chat
      const fallbackResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mistralKey}`,
        },
        body: JSON.stringify({
          model: 'pixtral-12b-2409',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: image } }
              ]
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      })
      if (!fallbackResponse.ok) {
        const errorBody = await fallbackResponse.text()
        res.status(fallbackResponse.status).send({ error: `Vision API fallback error: ${errorBody}` })
        return
      }
      const data = await fallbackResponse.json()
      const content = data.choices[0]?.message?.content
      res.status(200).send(JSON.parse(content))
      return
    }

    const data = await response.json()
    const annotationContent = data.pages?.[0]?.document_annotation?.content
    if (!annotationContent) {
      // Try fallback to vision if annotation is empty
      res.status(500).send({ error: 'OCR annotation empty' })
      return
    }
    res.status(200).send(JSON.parse(annotationContent))
  } catch (error) {
    logger.error('Error scanning receipt:', error)
    res.status(500).send({ error: error.message })
  }
})

exports.generateSpendingInsight = onRequest({ cors: true }, async (req, res) => {
  try {
    const { summary } = req.body
    if (!summary) {
      res.status(400).send({ error: 'Missing summary payload' })
      return
    }

    const mistralKey = process.env.MISTRAL_API_KEY
    if (!mistralKey) {
      res.status(500).send({ error: 'Mistral API key is not configured on Firebase Cloud Functions' })
      return
    }

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
        'Authorization': `Bearer ${mistralKey}`,
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
      res.status(response.status).send({ error: `Mistral API error: ${errorBody}` })
      return
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    res.status(200).send(JSON.parse(content))
  } catch (error) {
    logger.error('Error generating spending insight:', error)
    res.status(500).send({ error: error.message })
  }
})

const { onSchedule } = require('firebase-functions/v2/scheduler')

exports.monthlyRecap = onSchedule("0 9 1 * *", async (event) => {
  logger.info('Scheduled monthly recap runs successfully at 9 AM on the 1st of every month.')
})




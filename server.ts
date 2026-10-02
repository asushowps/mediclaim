import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Extraction endpoint
app.post('/api/extract-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', filename = 'receipt.jpg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY environment variable is not configured. Please check the Secrets panel.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Strip data URL header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const prompt = `You are an expert medical receipt and clinic invoice OCR extractor for corporate medical benefit and insurance claims.
Carefully inspect the uploaded medical receipt / tax invoice / clinic bill and extract the following required fields:
1. Name of Employee (Patient name or employee name listed on receipt. If initials or title like Mr/Ms/Dr are present, format cleanly as standard name e.g. "John Tan Wei Ming")
2. Clinic Name (Name of the clinic, medical practice, healthcare clinic, hospital, or dental centre e.g. "Raffles Medical Group", "Healthway Medical Clinic")
3. Sub-Total (Numeric subtotal of consultation + medicine/services before GST/VAT/Sales Tax. Example: 45.00)
4. GST (Goods & Services Tax / VAT / tax amount. Example: 4.05. If 0 or exempt or not stated, return 0.00)
5. Grand Total (Total amount paid or payable. Example: 49.05. If Sub-Total + GST does not match Grand Total exactly due to rounding or missing GST, prioritize the printed final total for Grand Total, and ensure Sub-Total + GST = Grand Total where feasible)
6. Summary of illness (Reason for visit, diagnosis, symptoms, consultation reason, or condition treated e.g. "Acute Upper Respiratory Tract Infection (URTI)", "Gastric Flu / Acute Gastroenteritis", "Migraine / Tension Headache", "Allergic Rhinitis", "Routine Health Screening", "Skin Rash / Contact Dermatitis". If not explicitly diagnosed, infer logically from prescribed items/medicines, or provide "General Outpatient Consultation & Medication")

Additional helpful fields:
- Date of consultation / receipt in YYYY-MM-DD format
- Receipt or Invoice reference number
- Currency code (e.g. SGD, USD, MYR, EUR, or $)
- Confidence rating ("HIGH", "MEDIUM", "LOW")
- Itemized line items if any

Return strictly valid JSON conforming to the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            employeeName: {
              type: Type.STRING,
              description: 'Full name of the employee or patient on the receipt',
            },
            clinicName: {
              type: Type.STRING,
              description: 'Official name of the medical clinic or healthcare provider',
            },
            subTotal: {
              type: Type.NUMBER,
              description: 'Sub-total amount before GST/tax (e.g. 50.00)',
            },
            gst: {
              type: Type.NUMBER,
              description: 'GST or tax amount (e.g. 4.50). Use 0 if none.',
            },
            grandTotal: {
              type: Type.NUMBER,
              description: 'Grand total / total amount paid or payable (e.g. 54.50)',
            },
            illnessSummary: {
              type: Type.STRING,
              description: 'Concise summary of illness, diagnosis, or consultation reason',
            },
            receiptDate: {
              type: Type.STRING,
              description: 'Receipt date in YYYY-MM-DD or as printed',
            },
            receiptNumber: {
              type: Type.STRING,
              description: 'Invoice or receipt number if available',
            },
            currency: {
              type: Type.STRING,
              description: 'Currency code or symbol (e.g. SGD, USD, $)',
            },
            confidence: {
              type: Type.STRING,
              description: 'Extraction confidence rating HIGH, MEDIUM, or LOW',
            },
            lineItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                },
              },
              description: 'Breakdown of consultation, medications, or lab tests if listed',
            },
          },
          required: [
            'employeeName',
            'clinicName',
            'subTotal',
            'gst',
            'grandTotal',
            'illnessSummary',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No text returned from Gemini model');
    }

    const parsed = JSON.parse(text);

    // Sanitize and ensure numeric numbers
    const subTotal = typeof parsed.subTotal === 'number' ? parsed.subTotal : parseFloat(parsed.subTotal) || 0;
    const gst = typeof parsed.gst === 'number' ? parsed.gst : parseFloat(parsed.gst) || 0;
    let grandTotal = typeof parsed.grandTotal === 'number' ? parsed.grandTotal : parseFloat(parsed.grandTotal) || 0;

    if (grandTotal === 0 && subTotal > 0) {
      grandTotal = +(subTotal + gst).toFixed(2);
    }

    return res.json({
      success: true,
      data: {
        employeeName: parsed.employeeName || 'Unknown Employee',
        clinicName: parsed.clinicName || 'Medical Clinic',
        subTotal: +subTotal.toFixed(2),
        gst: +gst.toFixed(2),
        grandTotal: +grandTotal.toFixed(2),
        illnessSummary: parsed.illnessSummary || 'General Medical Consultation',
        receiptDate: parsed.receiptDate || new Date().toISOString().split('T')[0],
        receiptNumber: parsed.receiptNumber || 'REC-' + Math.floor(100000 + Math.random() * 900000),
        currency: parsed.currency || 'SGD',
        confidence: parsed.confidence || 'HIGH',
        lineItems: parsed.lineItems || [],
        originalFilename: filename,
      },
    });
  } catch (error: any) {
    console.error('OCR Extraction error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to extract receipt data using OCR.',
      details: error.toString(),
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port} (mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

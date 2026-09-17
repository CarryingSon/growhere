import Anthropic from '@anthropic-ai/sdk';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { ANALYSIS_PROMPT } from './prompt.js';
import { stripFences, validateAnalysis } from './validate.js';

const PORT = Number(process.env.PORT ?? 3001);
const MODEL = 'claude-sonnet-5';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Manjka ANTHROPIC_API_KEY. Ustvari server/.env po vzoru server/.env.example.');
  process.exit(1);
}

const client = new Anthropic();
const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/analyze', async (req, res) => {
  const image = req.body?.image;

  if (typeof image !== 'string' || image.length < 100) {
    res.status(400).json({ error: 'Manjka slika (base64 JPEG) v polju "image".' });
    return;
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: image },
            },
            { type: 'text', text: ANALYSIS_PROMPT },
          ],
        },
      ],
    });

    if (response.stop_reason === 'refusal') {
      res.status(422).json({ error: 'Model je zavrnil analizo te slike. Poskusi z drugo fotografijo sobe.' });
      return;
    }

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (!text) {
      res.status(502).json({ error: 'Model ni vrnil besedila z rezultatom.' });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(stripFences(text));
    } catch {
      res.status(502).json({ error: 'Odgovora modela ni bilo mogoče prebrati kot JSON. Poskusi znova.' });
      return;
    }

    res.json(validateAnalysis(parsed));
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      res.status(500).json({ error: 'Napačen ali potekel API ključ na strežniku.' });
      return;
    }
    if (error instanceof Anthropic.RateLimitError) {
      res.status(429).json({ error: 'Preveč zahtev naenkrat. Počakaj trenutek in poskusi znova.' });
      return;
    }
    if (error instanceof Anthropic.APIConnectionError) {
      res.status(504).json({ error: 'Strežnik ni mogel doseči Claude API. Preveri internetno povezavo.' });
      return;
    }

    const message = error instanceof Error ? error.message : 'Neznana napaka.';
    console.error('Napaka pri analizi:', message);
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GrowHere strežnik posluša na http://0.0.0.0:${PORT}`);
  console.log('Na telefonu uporabi lokalni IP računalnika, ne "localhost".');
});

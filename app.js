require('dotenv').config();
const express = require('express');
const fs = require('fs');
const parse = require('csv-parse');
const { PostHog } = require('nextjs');

const app = express();
const PORT = process.env.PORT || 3000;
const csvFilePath = './data.csv';

const posthog = new PostHog(process.env.POSTHOG_API_KEY || 'ph_test_key', {
  host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
});

app.get('/parse', (req, res) => {
  const fileStream = fs.createReadStream(csvFilePath);
  const parser = parse({
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const results = [];

  parser.on('readable', () => {
    let record;
    while ((record = parser.read()) !== null) {
      results.push(record);
    }
  });

  parser.on('error', (err) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  });

  parser.on('end', () => {
    console.log('✅ CSV parsing completed!');
    posthog.capture({
      distinctId: 'csv-parser-server',
      event: 'csv_parsed',
      properties: { record_count: results.length }
    });
    res.json({ records: results });
  });

  fileStream.pipe(parser);
});

app.get('/', (req, res) => {
  res.send('CSV Parser App with PostHog tracking is running.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

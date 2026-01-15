# ipsos-55030

A simple Node.js + Express app that:
- Parses CSV files using `@postman/csv-parse`
- Uses environment variables with `dotenv`
- Tracks CSV parsing events using `@posthog/nextjs`

## Setup
```bash
npm install
npm start
```

Visit:
- `http://localhost:3000/` → App home
- `http://localhost:3000/parse` → Parse the CSV and see results

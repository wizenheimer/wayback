<h3 align="center"> Wayback </h3>

<p align="center">Literally just a blazing fast screenshot service</p>

Wayback is a screenshot service built on Cloudflare Workers that saves webpage screenshots to R2. It uses Shawty deployed on Lambda for reliable captures and focuses on being straightforward and dependable. Built on Cloudflare Workers because I'm not a moron who likes paying for servers during idle hours. All your screenshots get yeeted straight into R2 storage (which is basically S3 but cooler).

## Features

- Full page screenshots (duh)
- Blocks ads and cookie notices (because why wouldn't you?)
- Dark mode support
- Multiple output formats (base64/binary) (in case you care about that stuff)
- Cloudflare R2 storage with dead simple REST interface
- Built for production (no, really)

## Usage

```typescript
// Take a screenshot
const response = await fetch("https://your-worker.dev/screenshot", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://example.com",
    darkMode: true,
    fullPage: true,
    imageQuality: 80,
  }),
});

const { paths } = await response.json();

// Get screenshot (returns base64)
const screenshot = await fetch(
  `https://your-worker.dev/screenshot/${paths.screenshot}`
);

// Get binary version if needed
const binary = await fetch(
  `https://your-worker.dev/screenshot/${paths.screenshot}?format=binary`
);
```

## Setup

1. Set environment variables:

```env
SCREENSHOT_SERVICE_API_KEY=your-shawty-api-key
SCREENSHOT_SERVICE_ORIGIN=your-aws-lambda-url
R2_BUCKET=your-bucket-name
```

2. Deploy to Cloudflare Workers

## Storage Structure

```
R2 Bucket:
└── screenshot/
    └── [url-hash]/
        └── [DDMMYYYY]/
```

## API

### Take Screenshot

```typescript
POST /screenshot
{
  url: string;          // Required
  fullPage?: boolean;   // Optional, default: true
  darkMode?: boolean;   // Optional, default: true
  imageQuality?: number;// Optional, default: 80
  viewport?: {          // Optional
    width: number;      // Default: 1920
    height: number;     // Default: 1080
  }
}
```

### Get Screenshot

```typescript
GET /screenshot/:hash/:date
Query params:
- format: 'base64' | 'binary' | 'json' (default: 'base64')
```

## Contributing

Contributions welcome. Please make sure any changes are well-tested.

1. Fork the repository
2. Create your feature branch
3. Test your changes
4. Submit a pull request

## License

MIT

Built by developers who needed a reliable screenshot service.

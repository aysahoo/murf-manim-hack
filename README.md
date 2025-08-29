# Murf Manim Hack

## ⚙️ Environment Setup

### Required API Keys

Create a `.env.local` file in your project root with the following:

```env
# Google AI (Required)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here

# E2B Sandbox (Required)
E2B_API_KEY=your_e2b_api_key_here

# Vercel Blob Storage (Required for deployment)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Murf AI (Optional - for voice generation)
MURF_API_KEY=your_murf_api_key_here
```

### API Key Setup Instructions

1. **Google AI API**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key to `GOOGLE_GENERATIVE_AI_API_KEY`

2. **E2B Sandbox**:
   - Sign up at [E2B.dev](https://e2b.dev)
   - Create a new API key in your dashboard
   - Copy the key to `E2B_API_KEY`

3. **Vercel Blob Storage**:
   - Deploy your project to Vercel
   - Go to Storage → Create → Blob
   - Copy the token to `BLOB_READ_WRITE_TOKEN`

4. **Murf AI** (Optional):
   - Sign up at [Murf.ai](https://murf.ai)
   - Get your API key from the developer section
   - Add to `MURF_API_KEY` (voice features work without this)

### Development vs Production

- **Development**: The app works without Murf AI - uses text-only narration
- **Production**: All API keys recommended for full functionality
- **Caching**: Vercel Blob Storage improves performance and reduces API costs

## 🛠️ Getting Started Next.js application that generates educational mathematical animations using Manim in a sandboxed environment. This project combines AI-powered concept explanation with dynamic mathematical visualizations.

## 🎯 Features

- **AI-Powered Concept Explanation**: Generate structured explanations for mathematical and scientific concepts
- **Manim Integration**: Create beautiful mathematical animations using Manim in a secure sandbox
- **E2B Sandbox Environment**: Execute code safely in isolated containers
- **Real-time Code Generation**: Generate Manim code dynamically based on user input
- **Interactive UI**: Modern, responsive interface with shader-based backgrounds

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Paper Design Shaders
- **AI**: Google AI SDK, OpenAI SDK
- **Sandbox**: E2B Code Interpreter
- **Animation**: Manim (Mathematical Animation Engine)
- **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- E2B account and API key
- OpenAI or Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ankit-Kumar20/murf-manim-hack.git
   cd murf-manim-hack
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your API keys:
   ```env
   # Google AI (Gemini) API Configuration
   # Get your API key from: https://makersuite.google.com/app/apikey
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here

   # E2B Code Interpreter API Configuration
   # Get your API key from: https://e2b.dev/docs
   E2B_API_KEY=your_e2b_api_key_here

   # E2B Template ID for Manim execution
   E2B_TEMPLATE_ID=q6wznn8hq65ffgkd0tqh

   # Murf AI API (optional for voice generation)
   MURF_API_KEY=your_murf_api_key_here

   # Vercel Blob Storage (for video/audio storage)
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
   ```

   **Note**: You can copy from `.env.example` and fill in your actual API keys.
   ```

4. **Run the development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 E2B Sandbox Setup

This project uses a custom E2B sandbox environment with Manim pre-installed.

### Sandbox Template: `q6wznn8hq65ffgkd0tqh`

The sandbox includes:
- Python 3.10
- Manim with all dependencies
- FFmpeg for video processing
- Cairo and Pango for rendering

### Building the Sandbox Template

If you need to rebuild the sandbox template:

```bash
e2b template build
```

The template configuration is defined in:
- `e2b.Dockerfile` - Docker configuration with Manim installation
- `e2b.toml` - E2B template configuration

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── code-execution/ # Code execution endpoint
│   │   │   └── generate-manim/ # Manim generation endpoint
│   │   ├── explain/           # Concept explanation pages
│   │   └── loading/           # Loading page
│   ├── components/            # React components
│   │   ├── ConceptInputForm.tsx
│   │   ├── Navbar.tsx
│   │   ├── ShaderBackground.tsx
│   │   └── TypewriterText.tsx
│   └── utils/                 # Utility functions
│       ├── formatManimCode.ts
│       ├── sandbox.ts         # E2B sandbox integration
│       ├── structuredManimGenerator.ts  # AI-powered Manim code generation
│       ├── voiceNarration.ts  # AI voice script generation
│       └── lessonBreakdown.ts # AI lesson structuring
├── public/                    # Static assets
├── e2b.Dockerfile            # Custom E2B sandbox configuration
├── e2b.toml                  # E2B template settings
└── test_manim.ipynb          # Manim testing notebook
```

## 🤖 AI Integration

This project uses multiple AI services to generate educational content:

### Google Gemini (Primary AI)
- **Purpose**: Generates Manim code, lesson breakdowns, and voice scripts
- **Models**: `gemini-1.5-flash` for fast, structured generation
- **Features**: 
  - Code generation with proper Manim syntax
  - Educational content structuring
  - Voice narration script creation

### Murf AI (Voice Generation)
- **Purpose**: Converts text scripts to natural-sounding voice audio
- **Features**: Professional educational voice styles
- **Integration**: Optional - works with or without API key

### AI-Powered Features

1. **Structured Manim Generation** (`structuredManimGenerator.ts`)
   - Generates production-ready Manim code
   - Validates and fixes common syntax issues
   - Follows Manim best practices

2. **Lesson Breakdown** (`lessonBreakdown.ts`)
   - Breaks complex topics into 3-4 mini-lessons
   - Creates timed segments (15 seconds each)
   - Generates synchronized animations and scripts

3. **Voice Narration** (`voiceNarration.ts`)
   - Creates educational voice scripts
   - Segments content for better pacing
   - Integrates with Murf AI for audio generation

### Content Caching
All AI-generated content is automatically cached using Vercel Blob Storage:
- Prevents redundant API calls
- Improves response times
- Reduces API costs

## 🔧 API Endpoints

### `/api/generate-manim`
Generates Manim code for mathematical concepts.

**Request:**
```json
{
  "topic": "quadratic functions",
  "details": "Show the graph transformation"
}
```

**Response:**
```json
{
  "success": true,
  "code": "from manim import *\n\nclass QuadraticFunction(Scene):\n    def construct(self):\n        ...",
  "explanation": "This animation demonstrates..."
}
```

### `/api/code-execution`
Executes code in the E2B sandbox environment.

**Request:**
```json
{
  "code": "print('Hello from sandbox!')",
  "language": "python"
}
```

## 🎨 Components

### ConceptInputForm
Interactive form for submitting mathematical concepts to visualize.

### ShaderBackground
Dynamic WebGL shader background for visual appeal.

### TypewriterText
Animated text component with typewriter effect.

### SubmittedTopicTitle
Displays the current topic being processed.

## 🔒 Security Features

- **Sandboxed Execution**: All code runs in isolated E2B containers
- **Input Validation**: Robust validation of user inputs
- **Rate Limiting**: API endpoints are rate-limited
- **Error Handling**: Comprehensive error handling and logging

## 🐛 Troubleshooting

### Common Issues

1. **E2B Sandbox Fails to Start**
   - Ensure your E2B API key is valid
   - Check that the template `q6wznn8hq65ffgkd0tqh` exists
   - Rebuild the template if necessary

2. **Manim Import Errors**
   - Verify the sandbox template includes all Manim dependencies
   - Check the Docker build logs for any installation issues

3. **API Key Errors**
   - Ensure all required environment variables are set
   - Verify API keys are valid and have sufficient quotas

### Testing the Sandbox

Use the provided test notebook:
```bash
jupyter notebook test_manim.ipynb
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [E2B Documentation](https://e2b.dev/docs)
- [Manim Documentation](https://docs.manim.community/)
- [Next.js Documentation](https://nextjs.org/docs)

## 📧 Support

For support, please open an issue on GitHub or contact the development team.

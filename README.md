# Murf Manim Hack

A Next.js application that generates educational mathematical animations using Manim in a sandboxed environment. This project combines AI-powered concept explanation with dynamic mathematical visualizations.

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
   E2B_API_KEY=your_e2b_api_key
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_AI_API_KEY=your_google_ai_api_key
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
│       └── structuredManimGenerator.ts
├── public/                    # Static assets
├── e2b.Dockerfile            # Custom E2B sandbox configuration
├── e2b.toml                  # E2B template settings
└── test_manim.ipynb          # Manim testing notebook
```

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

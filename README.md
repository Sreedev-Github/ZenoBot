# 🌍 ZenoBot - AI-Powered Travel Assistant

![ZenoBot Header](https://via.placeholder.com/1200x300/0a0a0a/ffffff?text=ZenoBot+Travel+Assistant)

ZenoBot is a sophisticated AI-powered travel planning assistant that generates detailed itineraries, helps find accommodations, and streamlines the entire travel planning experience.

[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/Animated%20with-GSAP-88CE02?style=flat-square)](https://greensock.com/)
[![Ollama](https://img.shields.io/badge/Powered%20by-Ollama-FF5A1F?style=flat-square)](https://ollama.com/)

## ✨ Features

- **🧠 AI-Generated Itineraries**: Get personalized, day-by-day travel plans based on your preferences
- **📅 Interactive Timeline UI**: Navigate through your itinerary with a sleek, animated interface
- **🏨 Hotel Search**: Find accommodations based on your budget and preferences
- **🌙 Dark/Light Mode**: Full support for light and dark themes
- **📱 Responsive Design**: Works seamlessly on desktops, tablets, and mobile devices

## 🚀 Demo

Check out the live demo: [ZenoBot Demo (Coming Soon)](#)

https://user-images.githubusercontent.com/[USERID]/[REPO]/assets/[USERID]/[VIDEO-ID].gif

## 📋 Table of Contents

- [Installation](#🛠️-installation)
- [Usage](#📝-usage)
- [Architecture](#🏗️-architecture)
- [Streaming System](#🔄-streaming-system)
- [User Interface](#💻-user-interface)
- [API Reference](#📚-api-reference)
- [Technologies](#⚙️-technologies)
- [Contributing](#🤝-contributing)
- [License](#📄-license)

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/ZenoBot.git
cd ZenoBot/zenobot
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Setup**

Create a `.env.local` file in the project root with the following variables:

```bash
# Ollama API endpoint (for AI responses)
OLLAMA_API_URL=http://localhost:11434/api/chat
# SERP API key (for hotel search)
SERP_API_KEY=your_serp_api_key
```

4. **Start Ollama** (required for AI functionality)

Make sure you have [Ollama](https://ollama.com/) installed and running with the required model.

```bash
ollama run zenobot
```

5. **Start the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📝 Usage

### Creating a Travel Plan

1. Navigate to the home page
2. Enter your starting location
3. Select your destination
4. Choose your travel dates
5. Specify your trip duration (1-14 days)
6. Select your budget preference
7. ZenoBot will generate a personalized itinerary

### Navigating the Itinerary Timeline

- Scroll up/down to move between days
- Click on specific dates in the timeline to jump to that day
- Use keyboard arrow keys for navigation
- Tap the "First Day" or "Last Day" buttons to jump to the beginning or end

### Finding Hotels

The hotel search feature allows you to:

- Find accommodations near your destination
- Filter by price range, star rating, and amenities
- View property details and booking information

## 🏗️ Architecture

ZenoBot is built on a modern web architecture:

- **Frontend**: Next.js 14 with React
- **Styling**: Tailwind CSS with theme support
- **Animations**: GSAP for smooth transitions
- **AI Integration**: Ollama API for itinerary generation
- **External APIs**: SERP API for hotel searches

The application follows a streaming architecture for AI responses, providing real-time feedback as the itinerary is generated.

## 🔄 Streaming System

ZenoBot uses a sophisticated streaming system to provide real-time feedback during itinerary generation:

1. **User Query**: The user submits travel details
2. **Backend Processing**: The query is sent to Ollama's API with streaming enabled
3. **SSE Stream**: Responses are streamed back using Server-Sent Events
4. **Frontend Rendering**: The UI displays each day's activities as they're generated

This approach provides a more engaging user experience with immediate feedback compared to traditional "loading" screens.

## 💻 User Interface

### Home Page

The multi-step form guides users through the travel planning process with smooth animations and intuitive navigation.

### Timeline View

The timeline interface presents the itinerary in a visually appealing format:

- Vertical timeline with day indicators
- Detailed cards for morning, afternoon, evening, and additional activities
- Smooth transitions between days
- Responsive design that works on all device sizes

### Dark Mode Support

The application fully supports dark and light modes, adapting to user preferences or system settings.

## 📚 API Reference

POST /api/ask-query

```json
{
  "query": "I'm planning a trip to City, State from City, State between 2025-04-04 and 2025-04-10. Could you help me create a detailed itinerary?"
}
```

### Hotel Search - Deprecated for now

### POST /api/search-hotel

```json
{
  "location": "State, Country",
  "checkinDate": "2025-04-04",
  "checkoutDate": "2025-04-10",
  "minPrice": 2000,
  "maxPrice": 5000,
  "hotelClass": 4
}
```

## ## ⚙️ Technologies

- Next.js: React framework for server-rendered applications
- React: Frontend library for UI components
- Tailwind CSS: Utility-first CSS framework
- GSAP: Animation library for smooth transitions
- Framer Motion: Animation library for React components
- Ollama: Lightweight AI model server
- SERP API: Google Search API for hotel data
- Server-Sent Events: Real-time data streaming

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

Built by Sreedev

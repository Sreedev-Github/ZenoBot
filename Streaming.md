# 🧭 ZenoBot Travel Itinerary Streaming System

ZenoBot is an AI-powered travel assistant that generates detailed itineraries within a single state or region. This README provides a comprehensive overview of how streaming is used to deliver real-time itinerary generation for a seamless user experience.

---

## 🚀 Overview

Traditional API responses send data only when everything is ready. In contrast, **streaming** sends data incrementally, improving responsiveness and user satisfaction. This is especially useful when generating long or complex itineraries.

ZenoBot uses **Server-Sent Events (SSE)** to stream itinerary data from the AI backend to the frontend UI, showing progress live.

---

## 🔁 How Streaming Works

### 🧩 Components

1. **Backend API** (`/api/ask-query/route.js`)  
   Connects to the AI model and streams the response.

2. **Frontend Component** (`QueryStreaming.jsx`)  
   Displays the streamed content live as it's received.

3. **AI Model**  
   ZenoBot's custom model (powered via Ollama) generates tailored travel plans.

---

## 🛠️ Step-by-Step Streaming Process

### ✅ Step 1: User Makes a Request

- The user submits travel details via the UI.
- Extra instructions are appended to the query to focus on **destination activities**.
- The frontend sends this structured prompt to the backend.

---

### 🧠 Step 2: Backend Streams Response

- The backend sends the prompt to the AI model using **Ollama’s streaming API**.
- A `TransformStream` is opened to send chunks of data to the frontend.

```js
const stream = new TransformStream();
const writer = stream.writable.getWriter();
```

### 📘 Explanation:
- `TransformStream` is a Web API used to handle streaming transformations of data.
- It provides a `readable` and a `writable` stream.
- `getWriter()` returns a `WritableStreamDefaultWriter`, which allows writing data chunks into the stream.

### 🔁 Streaming Loop

```js
const ollamaStream = await ollama.chat({
  model: 'zenobot',
  messages: [{ role: 'user', content: query }],
  stream: true,
});

for await (const chunk of ollamaStream) {
  if (chunk.message?.content) {
    const content = chunk.message.content;
    await writer.write(
      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
    );
  }
}
```

---

### 💻 Step 3: Frontend Processes the Stream

```js
while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  accumulatedResponse += data.content;
  setStreamingResponse(accumulatedResponse);
}
```

### 📘 Explanation:
- `ReadableStream` is used to read chunks as they arrive.
- `TextDecoder` decodes UTF-8 text.
- Each chunk is added to the ongoing response and used to update the UI.

---

### 🖼️ Step 4: Final Display

- Once the full response is received, it's parsed into structured JSON.
- UI renders days, locations, and time-based activities with proper formatting.

---

## 🎨 Visual Feedback States

| State            | Description |
|------------------|-------------|
| `Loading`        | Displays `"Generating your itinerary..."` with animation |
| `Streaming`      | Shows raw JSON stream under `"Raw Response (Loading...)"` |
| `Complete`       | Switches to a full itinerary with structured sections |

---

## 🔍 Technical Implementation Details

### 1. Server-Sent Events (SSE)

Data is streamed using the SSE protocol in this format:

```
data: {"content":"partial response here"}\n\n
```

The `\n\n` marks the end of a chunk.

---

### 2. Stream Parsing (Frontend)

- Uses `ReadableStream`, `TextDecoder`, and regex to extract valid JSON.
- React state is used to update UI progressively.

---

### 3. Error Handling

ZenoBot handles various edge cases:

- **Connection issues** (e.g. API unreachable)
- **Malformed JSON** from the AI
- **AI refusals** to generate plans (e.g. unsupported regions or invalid prompts)

---

## 🌟 Benefits of Streaming

✅ **Faster Perceived Performance**  
✅ **Better UX with Immediate Feedback**  
✅ **Partial Recovery if Interrupted**

---

## 🧰 Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React, Next.js |
| Backend     | Next.js API Routes |
| AI Engine   | Llama 3.2 via [Ollama](https://ollama.com) |
| Streaming   | Server-Sent Events (SSE) |
| Styling     | Tailwind CSS |

---

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| ❌ No response | Ensure API endpoint is correct and Ollama is running |
| ⚠️ Malformed JSON | Inspect raw stream for AI errors |
| 📉 Incomplete itineraries | Review model prompt configuration |

---

## 📎 Notes

- This system currently supports **in-state** or **single-region** itineraries.
- Streaming may not perform well if used with very slow models or extremely large prompts.

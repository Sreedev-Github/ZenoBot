import { NextResponse } from "next/server";
import { Ollama } from "ollama";
import connectDB from "@/lib/dbConnect.js";
import ResponseModel from "@/models/Response.model.js";

const ollama = new Ollama({
  model: "zenobot", // Make sure your model name matches what you've created
  baseUrl: "http://localhost:11434",
});

export async function POST(req) {
  try {
    // Connect to database
    await connectDB();

    // Parse the request body
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return new NextResponse(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create a new TransformStream for streaming
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start a non-blocking response with streaming
    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    // Process in the background
    (async () => {
      try {
        // Track the accumulated response to save to DB later
        let fullResponse = "";

        // Stream the response from Ollama
        const ollamaStream = await ollama.chat({
          model: "zenobot",
          messages: [{ role: "user", content: query }],
          stream: true,
        });

        // Process each chunk as it arrives
        for await (const chunk of ollamaStream) {
          if (chunk.message?.content) {
            const content = chunk.message.content;
            fullResponse += content;

            // Send chunk to client
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }
        }

        // Save the complete response to DB
        await saveQueryResponse(query, fullResponse);

        // Signal the end of the stream
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
        );
        await writer.close();
      } catch (error) {
        console.error("Error processing stream:", error);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ error: error.message })}\n\n`
          )
        );
        await writer.close();
      }
    })();

    return response;
  } catch (error) {
    console.error("API route error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Function to save the query and response to the database
async function saveQueryResponse(query, answer) {
  try {
    const newResponse = new ResponseModel({ query, answer });
    await newResponse.save();
    console.log("Response saved successfully");
  } catch (error) {
    console.error("Error saving response:", error.message);
  }
}

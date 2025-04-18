import { NextResponse } from "next/server";
import { Ollama } from "ollama";
import connectDB from "@/lib/dbConnect.js";
import ResponseModel from "@/models/Response.model.js";
// Remove the "from util" part - TextEncoder is a global
const TextEncoder = globalThis.TextEncoder;

export const runtime = "nodejs";

export async function POST(request) {
  try {
    // Connect to database
    await connectDB();

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const ollama = new Ollama({
      host: process.env.OLLAMA_HOST || "http://localhost:11434",
    });

    // Create a stream for sending data to the client
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Helper function to send events
    const sendEvent = async (type, data) => {
      // console.log(`Sending event: ${type}`, data); // Log the event being sent
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`)
      );
    };

    // Create a session ID for this query
    const sessionId = `session_${Date.now()}`;

    // Store the complete response
    let completeResponse = {
      query,
      timestamp: new Date().toISOString(),
      sessionId,
      rawResponse: "",
      processedData: {
        days: {},
      },
    };

    // Process in a separate async function to enable streaming
    (async () => {
      try {
        // Stream from ollama
        const ollamaStream = await ollama.chat({
          model: "zenobot01",
          messages: [{ role: "user", content: query }],
          stream: true,
        });

        let buffer = "";
        let currentDay = 0;
        let currentSection = null;
        let propertiesInProgress = {};
        let sentProperties = new Set(); // Track what we've already sent

        // Define section markers to watch for
        const sectionMarkers = [
          { marker: '"dayStart": "[DayStart]"', section: "dayStart" },
          { marker: '"morningStart": "[MorningStart]"', section: "morning" },
          {
            marker: '"afternoonStart": "[AfternoonStart]"',
            section: "afternoon",
          },
          { marker: '"eveningStart": "[EveningStart]"', section: "evening" },
          {
            marker: '"additionalActivityStart": "[AdditionalActivityStart]"',
            section: "additionalActivity",
          },
          { marker: '"dayEnd": "[DayEnd]"', section: "dayEnd" },
        ];

        // Process each chunk from the AI model
        for await (const chunk of ollamaStream) {
          if (chunk.message?.content) {
            const content = chunk.message.content;
            buffer += content;
            completeResponse.rawResponse += content; // Save raw response

            // Send raw content for debugging
            await sendEvent("content", { content });

            // Check for new section markers
            for (const { marker, section } of sectionMarkers) {
              if (buffer.includes(marker) && currentSection !== section) {
                currentSection = section;

                if (section === "dayStart") {
                  currentDay++;
                  // console.log(`Starting new day: ${currentDay}`);

                  // Wait until the buffer contains the full "date" string
                  let date = null;
                  const dateRegex = /"date":\s*"([^"]+)"/;

                  // Keep processing chunks until the date is found
                  while (!date) {
                    const dateMatch = buffer.match(dateRegex);

                    if (dateMatch) {
                      date = dateMatch[1];
                    } else {
                      // Wait for the next chunk to arrive
                      const { value, done } = await ollamaStream[
                        Symbol.asyncIterator
                      ]().next();
                      if (done) {
                        break;
                      }

                      const content = value.message?.content || "";
                      buffer += content;
                      completeResponse.rawResponse += content; // Save raw response
                    }
                  }

                  if (!date) {
                    continue; // Skip processing this day if the date is not found
                  }

                  // Save to processed data
                  completeResponse.processedData.days[currentDay] = {
                    date,
                    sections: {},
                  };

                  await sendEvent("sectionStart", {
                    section,
                    dayNumber: currentDay,
                    date,
                  });

                  propertiesInProgress = {};
                } else if (section === "dayEnd") {
                  // console.log(`Ending day: ${currentDay}`);
                  await sendEvent("sectionEnd", {
                    section,
                    dayNumber: currentDay,
                  });

                  // Reset section to prepare for next day
                  currentSection = null;
                }

                // Trim the buffer to remove processed content
                buffer = buffer.substring(
                  buffer.indexOf(marker) + marker.length
                );
              }
            }

            // Extract and send individual properties for the current section
            if (
              currentSection &&
              currentSection !== "dayStart" &&
              currentSection !== "dayEnd"
            ) {
              // Define property patterns to watch for each section
              const sectionObject =
                currentSection === "additionalActivity"
                  ? "additionalActivity"
                  : currentSection;

              // Extract object contents using regex
              const objectRegex = new RegExp(
                `"${sectionObject}"\\s*:\\s*{([^}]*)}`,
                "s"
              );
              const objectMatch = buffer.match(objectRegex);

              if (objectMatch) {
                const properties = objectMatch[1].trim();

                // Define properties to extract
                const propertyTypes = [
                  { key: "name", pattern: /"name"\s*:\s*"([^"]+)"/ },
                  { key: "location", pattern: /"location"\s*:\s*"([^"]+)"/ },
                  {
                    key: "description",
                    pattern: /"description"\s*:\s*"([^"]+)"/,
                  },
                ];

                // Add transportation for time sections but not for additionalActivity
                if (currentSection !== "additionalActivity") {
                  propertyTypes.push({
                    key: "transportation",
                    pattern: /"transportation"\s*:\s*"([^"]+)"/,
                  });
                }

                // Check for each property and send if found
                for (const { key, pattern } of propertyTypes) {
                  const propMatch = properties.match(pattern);

                  if (propMatch) {
                    const value = propMatch[1];
                    const propId = `day${currentDay}_${currentSection}_${key}_${value}`;

                    // Only send if we haven't sent this exact property before
                    if (!sentProperties.has(propId)) {
                      sentProperties.add(propId);

                      if (key && value && currentSection) {
                        await sendEvent("property", {
                          section: currentSection,
                          key,
                          value,
                          dayNumber: currentDay,
                        });
                      }

                      // Ensure propertiesInProgress[currentSection] is initialized
                      if (!propertiesInProgress[currentSection]) {
                        propertiesInProgress[currentSection] = {}; // Initialize if undefined
                      }
                      propertiesInProgress[currentSection][key] = value;

                      // Make sure day exists in processed data
                      if (!completeResponse.processedData.days[currentDay]) {
                        completeResponse.processedData.days[currentDay] = {
                          date: "",
                          sections: {},
                        };
                      }

                      // Make sure section exists
                      if (
                        !completeResponse.processedData.days[currentDay]
                          .sections[currentSection]
                      ) {
                        completeResponse.processedData.days[
                          currentDay
                        ].sections[currentSection] = {};
                      }

                      // Save to processed data
                      completeResponse.processedData.days[currentDay].sections[
                        currentSection
                      ][key] = value;
                    }
                  }
                }
              }
            }
          }
        }

        // Stream is complete
        await sendEvent("done", { message: "Stream complete" });

        // Save to MongoDB using your ResponseModel
        try {
          // Format the data for your ResponseModel schema
          const responseData = {
            query,
            answer: completeResponse.rawResponse,
            processedData: completeResponse.processedData,
            timestamp: new Date(),
            sessionId,
          };

          // Add additional logging to debug MongoDB save issues
          console.log("Saving response to MongoDB with session ID:", sessionId);
          
          const newResponse = new ResponseModel(responseData);
          await newResponse.save();
          console.log("Response saved to MongoDB successfully with ID:", newResponse._id);
          
          // Send the MongoDB ID back to the client for reference
          await sendEvent("savedToDb", { 
            success: true, 
            responseId: newResponse._id.toString(),
            sessionId 
          });
        } catch (dbError) {
          console.error("Error saving to MongoDB:", dbError);
          await sendEvent("savedToDb", { success: false, error: dbError.message });
        }
      } catch (error) {
        console.error("Error in streaming:", error);
        // Only try to write if the writer is not closed
        try {
          await sendEvent("error", { message: error.message });
        } catch (writeError) {
          console.error("Error sending error event:", writeError);
        }
      } finally {
        // Safely close the writer
        try {
          // Check if the writer is still writable before attempting to close
          if (!writer.closed) {
            try {
              await writer.close();
            } catch (e) {
              // Writer might have been closed already, which is fine
              console.log("Note: Writer was already closed");
            }
          }
        } catch (closeError) {
          console.error("Error checking writer state:", closeError);
        }
      }
    })();

    // Return the stream to the client
    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("Error in API route:", e);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

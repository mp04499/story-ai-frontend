"use server";

// Import types for request and response payloads
import { StoryRequest, StoryResponse } from "@/types/story";
import { SYSTEM_MESSAGE } from "@/constants";

// Get the base URL for the story LLM inference API from environment variables
const baseUrl = process.env.STORY_LLM_INFERENCE_URL;

// Type definition for a chunk of a streamed response
export type StreamResponseChunk<T> = {
  iteratorResult: IteratorResult<T>;
  next?: Promise<StreamResponseChunk<T>>;
};

// Helper function to recursively stream chunks from an async generator
async function streamChunk<T>(generator: AsyncGenerator<T>) {
  const next = generator.next();
  return new Promise<StreamResponseChunk<T>>((resolve, reject) => {
    next.then((res) => {
      if (res.done) resolve({ iteratorResult: res });
      else resolve({ iteratorResult: res, next: streamChunk(generator) });
    });
    next.catch((error) => reject(error));
  });
}

// Higher-order function to wrap an async generator and return a streaming interface
function streamResponse<T, P extends string[]>(
  createGenerator: (...args: P) => AsyncGenerator<T>,
) {
  return (...args: Parameters<typeof createGenerator>) => {
    const generator = createGenerator(...args);
    return streamChunk<T>(generator);
  };
}

// Main function to get a story from the API, streamed as chunks
export const getStory = streamResponse(async function* (text: string) {
  // Construct the API endpoint URL
  const url = `${baseUrl}/v1/chat/completions`;

  // Build the request payload for the story model
  const request = {
    model: "GawdSB/story_model",
    messages: [SYSTEM_MESSAGE, { role: "user", content: text }],
    max_new_token: 2000,
    top_k: 50,
    top_p: 0.95,
    num_return_sequences: 1,
    do_sample: true,
    stream: true,
  } as StoryRequest;

  // Log the request for debugging
  console.log(JSON.stringify(request));

  // Send the POST request to the story API
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
      Connection: "keep-alive",
    },
  });

  // Throw an error if the response is not OK
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Get a reader for the response body stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");

  if (!reader) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  // Continuously read from the stream until done
  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      console.log("Stream closed");
      break;
    }

    // Decode the received chunk into a string
    const chunk = decoder.decode(value, { stream: true });

    // Split the chunk on newlines (for SSE events)
    const chunks = chunk.split("\n");
    for (const line of chunks) {
      if (line.trim() === "") continue; // Skip empty lines

      // Process lines that start with "data:"
      if (line.startsWith("data:")) {
        const data = line.substring(5).trim();
        try {
          // Attempt to parse the data as JSON (StoryResponse)
          const json = JSON.parse(data) as StoryResponse; // If the data is JSON
          console.log("Received JSON event:", json);
          const content = json.choices[0].delta.content;
          yield content; // Yield the content chunk to the consumer
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // If parsing fails, log the raw text event
          console.log("Received text event:", data);
        }
      }
    }
  }
  // Release the reader's lock on the stream
  reader.releaseLock();
});

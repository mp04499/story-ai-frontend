"use server";

import { StoryRequest, StoryResponse } from "@/types/story";
import { SYSTEM_MESSAGE } from "@/constants";

const baseUrl = process.env.STORY_LLM_INFERENCE_URL;

export type StreamResponseChunk<T> = {
  iteratorResult: IteratorResult<T>;
  next?: Promise<StreamResponseChunk<T>>;
};

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

function streamResponse<T, P extends string[]>(
  createGenerator: (...args: P) => AsyncGenerator<T>,
) {
  return (...args: Parameters<typeof createGenerator>) => {
    const generator = createGenerator(...args);
    return streamChunk<T>(generator);
  };
}

export const getStory = streamResponse(async function* (text: string) {
  const url = `${baseUrl}/v1/chat/completions`;

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

  console.log(JSON.stringify(request));

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      model: "GawdSB/story_model",
      messages: [
        {
          role: "system",
          content: "You are a imaginative story telling chat bot",
        },
        { role: "user", content: "make me a horror story" },
      ],
      max_new_tokens: 2000,
      top_k: 50,
      top_p: 0.95,
      num_return_sequences: 1,
      do_sample: true,
      stream: true,
    }),
    headers: {
      "Content-Type": "application/json",
      Connection: "keep-alive",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");

  if (!reader) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      console.log("Stream closed");
      break;
    }

    const chunk = decoder.decode(value, { stream: true });

    // Handle the received data (e.g., split on newlines for SSE events)
    const chunks = chunk.split("\n");
    for (const line of chunks) {
      if (line.trim() === "") continue; // Skip empty lines

      if (line.startsWith("data:")) {
        const data = line.substring(5).trim();
        try {
          const json = JSON.parse(data) as StoryResponse; // If the data is JSON
          console.log("Received JSON event:", json);
          const content = json.choices[0].delta.content;
          yield content;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          console.log("Received text event:", data);
        }
      }
    }
  }
});

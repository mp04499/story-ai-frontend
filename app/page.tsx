"use client";

// Import UI components and icons
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkle, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { getStory, StreamResponseChunk } from "@/api/story-api";

// Helper function to iterate over a streamed response using async iteration
function iterateStreamResponse<T>(
  streamResponse: Promise<StreamResponseChunk<T>>,
) {
  return {
    [Symbol.asyncIterator]: function () {
      return {
        current: streamResponse,
        async next() {
          // Await the next chunk from the stream
          const { iteratorResult, next } = await this.current;

          // If there is a next chunk, update current; otherwise, mark as done
          if (next) this.current = next;
          else iteratorResult.done = true;

          return iteratorResult;
        },
      };
    },
  };
}

// Main page component
export default function Home() {
  // State for the generated story text
  const [story, setStory] = useState("");
  // State to indicate if the story is being generated
  const [loading, setLoading] = useState(false);
  // State for the user's input text
  const [text, setText] = useState("");

  // Function to trigger story generation and handle streaming response
  const createStory = useCallback(async () => {
    setLoading(true);
    setStory("");
    try {
      // Iterate over the streamed story response and append each chunk
      for await (const value of iterateStreamResponse(getStory(text))) {
        setStory((prev) => prev + value)
      }
    } catch (error) {
      // Log any errors during streaming
      console.error(error);
    }
    setLoading(false);
  }, [text]);

  return (
    <div className="flex flex-col w-full min-h-screen place-items-center justify-center gap-4">
      {/* Display the generated story if available */}
      {story.length ? (
        <div className="flex justify-center">
          <ScrollArea className="w-2/4 min-h-20 max-h-96">{story}</ScrollArea>
        </div>
      ) : null}
      <div className="w-2/4 flex flex-row gap-2">
        <div className="w-full">
          {/* Input for user to type story prompt */}
          <Input
            disabled={loading}
            placeholder="Type text for story ai here, ex. 'create a fantasy storty'"
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div>
          {/* Button to trigger story generation, shows spinner if loading */}
          <Button
            variant="outline"
            size="icon"
            disabled={loading}
            onClick={createStory}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkle />}
          </Button>
        </div>
      </div>
    </div>
  );
}

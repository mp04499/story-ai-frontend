"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkle, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { getStory, StreamResponseChunk } from "@/api/story-api";

function iterateStreamResponse<T>(
  streamResponse: Promise<StreamResponseChunk<T>>,
) {
  return {
    [Symbol.asyncIterator]: function () {
      return {
        current: streamResponse,
        async next() {
          const { iteratorResult, next } = await this.current;

          if (next) this.current = next;
          else iteratorResult.done = true;

          return iteratorResult;
        },
      };
    },
  };
}

export default function Home() {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const createStory = useCallback(async () => {
    setLoading(true);
    setStory("");
    try {
      for await (const value of iterateStreamResponse(getStory(text))) {
        setStory((prev) => prev + value)
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, [text]);

  return (
    <div className="flex flex-col w-full min-h-screen place-items-center justify-center gap-4">
      {story.length ? (
        <div className="flex justify-center">
          <ScrollArea className="w-2/4 h-60">{story}</ScrollArea>
        </div>
      ) : null}
      <div className="w-2/4 flex flex-row gap-2">
        <div className="w-full">
          <Input
            disabled={loading}
            placeholder="Type text for story ai here, ex. 'create a fantasy storty'"
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div>
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

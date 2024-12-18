"use client";

import StoryComponent from "@/components/StoryClientComponent";

// function iterateStreamResponse<T>(
//   streamResponse: Promise<StreamResponseChunk<T>>,
// ) {
//   return {
//     [Symbol.asyncIterator]: function () {
//       return {
//         current: streamResponse,
//         async next() {
//           const { iteratorResult, next } = await this.current;
//
//           if (next) this.current = next;
//           else iteratorResult.done = true;
//
//           return iteratorResult;
//         },
//       };
//     },
//   };
// }

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen place-items-center justify-center gap-4">
      <StoryComponent />
    </div>
  );
}

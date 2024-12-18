import { generateStream } from "@/api/story-api";
import { Suspense } from "react";

export const responseStream = async (text: string) => {
  return generateStream(text);
};

export const StreamData = async ({
  generator,
}: {
  generator: AsyncGenerator<string, void, unknown>;
}) => {
  const response = await generator.next();
  await new Promise((resolve) => setTimeout(resolve, 500));
  const ret = await generator.return();
  if (ret.done) return null;

  return (
    <>
      {response.value}
      <Suspense>
        <StreamData generator={generator} />
      </Suspense>
    </>
  );
};

import { useState } from "react";

export const useStory = () => {
  const [story, setStory] = useState("");

  const addStory = (value: string) => {
    setStory(story + value);
  };

  const resetStory = () => {
    setStory("");
  };

  return { story, addStory, resetStory };
};

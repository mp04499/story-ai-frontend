import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkle } from "lucide-react";
import StoryServerComponent from "@/components/StoryServerComponent";

const StoryClientComponent = () => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [story, setStory] = useState("");

  const handleGenerateStory = async () => {
    setLoading(true);
    setStory(text);
  };

  return (
    <>
      {story ? <StoryServerComponent text={story} /> : null}
      <div className="w-2/4 flex flex-row gap-2">
        <div className="w-full">
          <Input
            disabled={loading}
            placeholder="Type text for story ai here, ex. 'create a fantasy story'"
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div>
          <Button
            variant="outline"
            size="icon"
            disabled={loading}
            onClick={handleGenerateStory}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkle />}
          </Button>
        </div>
      </div>
    </>
  );
};

export default StoryClientComponent;

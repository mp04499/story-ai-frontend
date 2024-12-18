import { Suspense, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { responseStream, StreamData } from "@/components/StreamData";

const StoryServerComponent = ({ text }: { text: string }) => {
    const stream = useRef<AsyncGenerator<string, void, unknown>>();

    useEffect(() => {
        const fetchStream = async () => {
            stream.current = await responseStream(text);
        };
        fetchStream();
    }, [text]);

    return (
        <div className="flex justify-center">
        <ScrollArea className="w-2/4 h-40">
        <Suspense fallback={<div>...</div>}>
    <StreamData generator={stream.current!} />
    </Suspense>
    </ScrollArea>
    </div>
);
};

    export default StoryServerComponent;
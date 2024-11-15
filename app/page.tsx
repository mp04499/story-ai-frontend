import Image from "next/image";
import { Input } from "@/components/ui/input"

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen place-items-center justify-center">
      <div className="w-2/4">
        <Input placeholder="Type text for story ai here, ex. 'create a fantasy storty'" />
      </div>
    </div>
  );
}

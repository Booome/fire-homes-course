import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import house1 from "./assets/house-1.webp";
import house2 from "./assets/house-2.jpeg";
import house3 from "./assets/house-3.jpeg";

export default function Page() {
  return (
    <div className="h-body w-full bg-home-hero bg-cover bg-center">
      <div className="mx-auto w-full max-w-screen-2xl h-full flex">
        <div className="flex-1 flex flex-col justify-center items-start w-3/5 h-full gap-10 pl-10 pr-20">
          <h1 className="text-background text-8xl font-bold mx-auto [text-shadow:_2px_2px_2px_rgb(0_0_0_/_40%)]">
            Your Journey to the Perfect Home Starts Here...
          </h1>
          <Button
            variant="outline"
            size="lg"
            className="text-2xl font-semibold rounded-full"
            asChild
          >
            <Link href="/search">Get Started</Link>
          </Button>
        </div>

        <div className="h-full flex justify-center items-start mr-20">
          <div className="relative bg-blue-100 w-80 h-96 mx-auto my-auto">
            <Image
              src={house1}
              alt="house"
              className="absolute shadow-lg w-full h-full bg-red-100 -rotate-12 -translate-x-10 -translate-y-5"
            ></Image>
            <Image
              src={house2}
              alt="house"
              className="absolute shadow-lg w-full h-full bg-red-200 rotate-6 translate-x-16"
            ></Image>
            <Image
              src={house3}
              alt="house"
              className="absolute shadow-lg w-full h-full bg-red-300 rotate-45 translate-x-24 translate-y-20"
            ></Image>
          </div>
        </div>
      </div>
    </div>
  );
}

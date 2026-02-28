import Image from "next/image";
import InputArea from "./InputArea";

export default function Page() {
  return (
    <div className="p-5 w-full flex flex-col items-center">
      <h1 className="py-5 text-2xl font-bold">
        Send feedback to OneNode team.
      </h1>
      <InputArea />

      <div className="w-full flex justify-center my-24">
        <div className="w-24">
          <Image
            src="https://onenode.ai/images/mainIcon.png"
            width={200}
            height={200}
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

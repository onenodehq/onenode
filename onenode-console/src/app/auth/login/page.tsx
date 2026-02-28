/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import Link from "next/link";
import GoogeLogin from "@/app/components/button/GoogleLogin";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from 'next/image';

export default async function Page() {
  const session = await auth();

  if (session?.user) redirect("/");

  return (
    <>
      {/*
            This example requires updating your template:
    
            ```
            <html class="h-full bg-gray-50">
            <body class="h-full">
            ```
          */}
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image
            className="mx-auto h-10 w-auto"
            src="https://www.onenode.ai/images/mainIcon.png"
            alt="OneNode"
            width={40}
            height={40}
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 sm:rounded-lg sm:px-12">
            <div className="mt-6 gap-4">
              <GoogeLogin />
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <Link
            className="rounded-full mt-24 py-1 px-4 border-gray border-2 text-gray-400 text-xs"
            href={"https://onenode.ai"}
          >
            Close
          </Link>
        </div>
      </div>
    </>
  );
}

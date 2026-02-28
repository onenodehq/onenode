"use client";
import { useAuthContext } from "@/app/contexts/AuthContext";
import sendFeedback from "@/app/utils/sendFeedback";
import toastOops from "@/app/utils/tost/toastOops";
import { useState } from "react";
import { toast } from "react-toastify";

export default function InputArea() {
  // Local state to track the input values
  const [comment, setComment] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const { user } = useAuthContext();

  // Function to handle the form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault(); // Prevent the default form submission behavior

      if (user?.email) {
        sendFeedback({
          email: user?.email,
          message: comment,
          need_response: checkboxValue,
        });
      }
    } catch {
      toastOops();
    }
    setComment("");
    toast.info("Thank you for your feedback!");
  };

  // Example function that accepts the arguments
  const example = (comment: string, checkboxValue: boolean) => {
    console.log("Comment:", comment);
    console.log("Checkbox value:", checkboxValue);
    // Add your logic here (e.g., make an API call or process the data)
  };

  return (
    <div className="flex w-full lg:w-1/2 items-start space-x-4">
      <div className="min-w-0 flex-1">
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col gap-y-4"
        >
          <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-600">
            <label htmlFor="comment" className="sr-only">
              Add your comment
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={5}
              placeholder="Add your comment..."
              className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="space-y-5">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="comments"
                  name="comments"
                  type="checkbox"
                  aria-describedby="comments-description"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  checked={checkboxValue}
                  onChange={(e) => setCheckboxValue(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="comments" className="font-medium text-gray-900">
                  I would like a response.
                </label>
                <p id="comments-description" className="text-gray-500">
                  Check this box if you&apos;d like the OneNode team to respond
                  to your comment. While a response is not guaranteed,
                  we&apos;ll do our best to get back to you if possible.
                </p>
              </div>
            </div>
          </div>
          {comment ? (
            <div className="flex justify-between py-2 pl-3 pr-2">
              <div className="flex w-full justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <></>
          )}
        </form>
      </div>
    </div>
  );
}

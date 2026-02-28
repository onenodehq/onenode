"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FeedbackData {
  message: string;
}

// Utility function to send feedback to the backend API
const sendFeedback = async (data: FeedbackData) => {
  try {
    // Use the local API endpoint
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send feedback');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending feedback:', error);
    throw error;
  }
};

export default function Feedback() {
  // Local state to track the input values
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to handle the form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission behavior
    
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await sendFeedback({
        message: comment,
      });
      setComment("");
      
      // Show a simple, elegant success toast
      toast.success("Thank you for your feedback!");
      
      console.log("Feedback submitted successfully:", result);
    } catch (error) {
      console.error("Feedback submission error:", error);
      
      // Fall back to the local API route if the main API call fails
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: comment }),
        });
        
        setComment("");
        toast.success("Thank you for your feedback!");
      } catch (fallbackError) {
        console.error("Fallback feedback submission error:", fallbackError);
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-container w-full my-6">
      <div className="bg-app-tertiary rounded-xl p-6 shadow-sm">
        <h4 className="text-lg font-semibold mb-3 text-app-primary">Share Your Thoughts</h4>
        <p className="text-sm text-app-secondary mb-4">
          Your feedback helps us improve our documentation. Let us know what you think!
        </p>
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col gap-y-4"
        >
          <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-app-primary focus-within:ring-2 focus-within:ring-blue-500">
            <label htmlFor="comment" className="sr-only">
              Add your feedback
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              placeholder="What did you think of this documentation? Any suggestions for improvement?"
              className="block w-full resize-none border-0 bg-app-primary p-3 text-app-primary focus:ring-0 sm:leading-6"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!comment.trim() || isSubmitting}
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 ${
                comment.trim() && !isSubmitting
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" 
                  : "bg-app-tertiary text-app-tertiary cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
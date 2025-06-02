// components/FeedbackButton.tsx
"use client";
import { useState } from "react";
import { MessageCircle, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import posthog from "posthog-js";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (rating === 0 && feedback.trim() === "") return;

    // Send to PostHog
    posthog.capture("feedback_submitted", {
      rating: rating,
      feedback: feedback.trim(),
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsSubmitted(false);
      setRating(0);
      setFeedback("");
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Thanks for your feedback! 🎉
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all z-50"
        title="Send Feedback"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Quick Feedback</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Star Rating */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                How was your experience?
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className={`p-1 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    } transition-colors duration-200`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Text Feedback */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Any thoughts? (optional)
              </p>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you love? What could be better?"
                className="resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">
                {feedback.length}/500 characters
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 && feedback.trim() === ""}
                className="flex-1"
              >
                Send Feedback
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Feedback helps improve the game for everyone
            </p>
          </div>
        </div>
      )}
    </>
  );
}

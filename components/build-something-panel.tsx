"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AIResponse,
  CardChoiceItem,
} from "@/components/templates/templateCompontents";

interface BuildSomethingPanelProps {
  onComplete: (result: {
    title: string;
    content: React.ReactNode;
    effect: "positive" | "neutral" | "negative";
    accepted: boolean;
    cost: number;
    return: number;
    aiResponse?: AIResponse; // New prop to pass entire AI response
  }) => void;
  availableFunds: number;
  problemStatement?: string;
}

export function BuildSomethingPanel({
  onComplete,
  availableFunds,
  problemStatement = "",
}: BuildSomethingPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Find business plan to include in request
      const businessPlanEl = document.querySelector(
        '[data-type="business-plan"]'
      );
      const businessPlan = businessPlanEl ? businessPlanEl.textContent : "";

      // Get all previous build logs to provide context
      const buildLogs = Array.from(
        document.querySelectorAll('[data-type="market-research"]')
      )
        .map((el) => el.textContent)
        .join("\n\n");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an AI assistant for a business simulation game.",
            },
            {
              role: "user",
              content: `As a startup founder, I want to: ${prompt}.`,
            },
          ],
          problemStatement: problemStatement,
          budget: availableFunds,
          businessPlan: businessPlan,
          buildLogs: buildLogs,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await res.json();
      console.log("API response:", data); // Debug log

      // Store the AI response
      setAIResponse(data);
    } catch (error) {
      console.error("Error calling AI endpoint:", error);
      setError("Sorry, there was an error processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate title from prompt
  const generateTitle = (prompt: string): string => {
    const words = prompt.split(" ").filter((w) => w.length > 3);
    const randomIndex = Math.floor(Math.random() * Math.min(words.length, 3));
    const baseWord = words[randomIndex] || "Project";
    const prefixes = ["Pro", "New", "Smart", "Swift", "Agile", "Next", "Rapid"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix} ${baseWord}`.substring(0, 15);
  };

  const handleAccept = () => {
    if (!aiResponse) return;

    if (aiResponse.type === "rejected") {
      // Create a notification about the rejection
      onComplete({
        title: "Proposal Rejected",
        content: (
          <div className="p-4">
            <p className="font-bold mb-2">Business Decision (Rejected):</p>
            <p className="mb-4">{prompt}</p>
            <p className="font-bold mb-2">Feedback:</p>
            <p className="text-red-600">{aiResponse.reason}</p>
          </div>
        ),
        effect: "negative",
        accepted: false,
        cost: 0,
        return: 0,
        aiResponse: aiResponse,
      });
    } else {
      // For accepted proposals
      const projectTitle = generateTitle(prompt);

      // Calculate the total cost - sum of all costs or 10% of budget if no costs
      let totalCost = 0;
      let expectedReturn = 0;

      // Try to extract costs from cardChoice components
      aiResponse.content.forEach((doc) => {
        if (doc.component.type === "cardChoice") {
          doc.component.data.forEach((card) => {
            totalCost += card.cost;
            expectedReturn += card.budgetImpact;
          });
        }
      });

      // If no costs found, use default
      if (totalCost === 0) {
        totalCost = Math.floor(availableFunds * 0.1);
        expectedReturn = Math.floor(totalCost * 1.5);
      }

      onComplete({
        title: projectTitle,
        content: (
          <div className="p-4">
            <p className="font-bold mb-2">Business Decision:</p>
            <p className="mb-4">{prompt}</p>
            <p className="font-bold mb-2">Outcome:</p>
            <p className="mb-2">
              Your decision has been approved. The proposed changes will be
              applied to your business.
            </p>
            <div className="mt-4 flex justify-between text-sm">
              <span>Investment: ${totalCost.toLocaleString()}</span>
              <span>Expected Return: ${expectedReturn.toLocaleString()}</span>
              <span className="font-semibold text-green-600">
                Positive outcome
              </span>
            </div>
          </div>
        ),
        effect: "positive",
        accepted: true,
        cost: totalCost,
        return: expectedReturn,
        aiResponse: aiResponse,
      });
    }
  };

  const handleDeny = () => {
    if (!aiResponse) return;

    // Generate title for the denied project
    const projectTitle = generateTitle(prompt);

    onComplete({
      title: projectTitle,
      content: (
        <div className="p-4">
          <p className="font-bold mb-2">Business Decision (Canceled):</p>
          <p>{prompt}</p>
          <p className="mt-4 text-gray-500 italic">
            You decided not to pursue this initiative.
          </p>
        </div>
      ),
      effect: "neutral",
      accepted: false,
      cost: 0,
      return: 0,
      aiResponse: aiResponse,
    });
  };

  // Determine if the proposal was accepted or rejected
  const isRejected = aiResponse?.type === "rejected";

  return (
    <div className="space-y-4">
      <p className="text-gray-700">
        Since you have a plan, why don't you start acting on it? Build something
        or do some research to move your business forward!
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to build or research in detail..."
          className="border rounded-md p-3 w-full h-32 resize-none"
          disabled={isLoading || !!aiResponse}
        />

        <div className="flex items-center space-x-4">
          {!aiResponse ? (
            <button
              type="submit"
              className={cn(
                "px-4 py-2 rounded-md font-medium text-white",
                "relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 hover:bg-blue-700",
                "after:absolute after:inset-0 after:bg-gradient-to-r after:from-blue-400 after:via-blue-600 after:to-blue-400 after:bg-[length:200%_100%] after:animate-gradient-x after:opacity-70"
              )}
              disabled={!prompt.trim() || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Processing...
                </span>
              ) : (
                "Build!"
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAccept}
                className={
                  isRejected
                    ? "bg-orange-600 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-700"
                    : "bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700"
                }
              >
                {isRejected ? "Acknowledge" : "Accept"}
              </button>

              {!isRejected && (
                <button
                  type="button"
                  onClick={handleDeny}
                  className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700"
                >
                  Deny
                </button>
              )}
            </>
          )}
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {aiResponse?.type === "rejected" && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <p className="font-medium text-red-700 mb-2">Proposal Rejected</p>
            <p className="text-sm text-red-800">{aiResponse.reason}</p>
          </div>
        )}
      </form>
    </div>
  );
}

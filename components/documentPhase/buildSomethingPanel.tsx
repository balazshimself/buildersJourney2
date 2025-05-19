"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BuildResponse = {
  tone: "negative" | "neutral" | "positive";
  initial_cost: number;
  monetary_return: number;
  chat_response: string;
  title: string;
  management: { title: string; content: string; tag: string };
  marketing: { title: string; content: string; tag: string };
  product: { title: string; content: string; tag: string };
};

interface BuildSomethingPanelProps {
  onComplete: (result: {
    title: string;
    content: React.ReactNode;
    effect: "negative" | "neutral" | "positive";
    accepted: boolean;
    cost: number;
    return: number;
    management: { title: string; content: string; tag: string };
    marketing: { title: string; content: string; tag: string };
    product: { title: string; content: string; tag: string };
  }) => void;
  availableFunds: number;
}

export function BuildSomethingPanel({
  onComplete,
  availableFunds,
}: BuildSomethingPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BuildResponse | null>(null);
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

      // Collect previous build logs to provide context
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
                "You are an AI assistant for a business simulation game. Your role is to evaluate business decisions and generate realistic outcomes based on user input.",
            },
            {
              role: "user",
              content: `As a startup founder, I want to: ${prompt}.`,
            },
          ],
          businessPlan,
          buildLogs,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Error calling AI endpoint:", error);
      setError(
        "Sorry, there was an error processing your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!response) return;

    onComplete({
      title: response.title,
      content: (
        <div className="space-y-4">
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
            <p className="font-bold mb-2">Business Decision:</p>
            <p className="mb-4">{prompt}</p>
          </div>

          <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded">
            <p className="font-bold mb-2">Outcome:</p>
            <p className="mb-2">{response.chat_response}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-3 border rounded-md bg-blue-50 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs font-semibold text-blue-700">
                <span className="px-1.5 py-0.5 rounded bg-blue-200 text-blue-800">
                  {response.product.tag}
                </span>
                <span>PRODUCT</span>
              </div>
              <h4 className="font-medium text-sm">{response.product.title}</h4>
              <p className="text-xs">{response.product.content}</p>
            </div>

            <div className="p-3 border rounded-md bg-green-50 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs font-semibold text-green-700">
                <span className="px-1.5 py-0.5 rounded bg-green-200 text-green-800">
                  {response.marketing.tag}
                </span>
                <span>MARKETING</span>
              </div>
              <h4 className="font-medium text-sm">
                {response.marketing.title}
              </h4>
              <p className="text-xs">{response.marketing.content}</p>
            </div>

            <div className="p-3 border rounded-md bg-purple-50 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs font-semibold text-purple-700">
                <span className="px-1.5 py-0.5 rounded bg-purple-200 text-purple-800">
                  {response.management.tag}
                </span>
                <span>MANAGEMENT</span>
              </div>
              <h4 className="font-medium text-sm">
                {response.management.title}
              </h4>
              <p className="text-xs">{response.management.content}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-between text-sm border-t pt-4">
            <span>Investment: ${response.initial_cost.toLocaleString()}</span>
            <span>
              Expected Return: ${response.monetary_return.toLocaleString()}
            </span>
            <span
              className={cn(
                "font-semibold",
                response.tone === "positive"
                  ? "text-green-600"
                  : response.tone === "negative"
                  ? "text-red-600"
                  : "text-yellow-600"
              )}
            >
              {response.tone.charAt(0).toUpperCase() + response.tone.slice(1)}{" "}
              outcome
            </span>
          </div>
        </div>
      ),
      management: response.management,
      product: response.product,
      marketing: response.marketing,
      effect: response.tone,
      accepted: true, // Mark as accepted
      cost: response.initial_cost,
      return: response.monetary_return,
    });
  };

  const handleDeny = () => {
    if (!response) return;

    onComplete({
      title: response.title,
      content: (
        <div className="p-4">
          <div className="p-4 border-l-4 border-gray-300 bg-gray-50 rounded">
            <p className="font-bold mb-2">Business Decision (Cancelled):</p>
            <p>{prompt}</p>
          </div>
          <div className="mt-4 p-4 border rounded-md bg-gray-100 text-gray-500 italic flex items-center gap-2">
            <AlertTriangle size={16} />
            <p>You decided not to pursue this initiative.</p>
          </div>
        </div>
      ),
      management: response.management,
      product: response.product,
      marketing: response.marketing,
      effect: response.tone, // Keep the effect type
      accepted: false, // Mark as not accepted
      cost: 0, // No cost for denied projects
      return: 0,
    });
  };

  const getOutcomeIcon = (tone: string) => {
    switch (tone) {
      case "positive":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "negative":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 flex gap-3">
        <div className="text-blue-500 mt-1">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <div>
          <h3 className="font-medium text-blue-800 mb-1">Build Something</h3>
          <p className="text-sm text-blue-700">
            Describe what you want to build or implement for your business. Be
            specific about your goals, target audience, and expected outcomes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="I want to build..."
          className="border rounded-md p-3 w-full h-32 resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          disabled={isLoading || !!response}
        />

        {!response ? (
          <Button
            type="submit"
            className={cn(
              "px-4 py-2 rounded-md font-medium text-white",
              "relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500",
              "hover:bg-blue-700 transition duration-200"
            )}
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Analyzing your business decision...
              </span>
            ) : (
              "Build This!"
            )}
          </Button>
        ) : (
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              {getOutcomeIcon(response.tone)}
              <h3 className="font-medium text-lg">{response.title}</h3>
            </div>

            <p className="mb-4 text-gray-700">{response.chat_response}</p>

            <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
              <div className="p-2 border rounded bg-white">
                <div className="text-blue-700 font-semibold">PRODUCT</div>
                <p className="mt-1">{response.product.content}</p>
              </div>

              <div className="p-2 border rounded bg-white">
                <div className="text-green-700 font-semibold">MARKETING</div>
                <p className="mt-1">{response.marketing.content}</p>
              </div>

              <div className="p-2 border rounded bg-white">
                <div className="text-purple-700 font-semibold">MANAGEMENT</div>
                <p className="mt-1">{response.management.content}</p>
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <div>
                Initial investment:{" "}
                <span className="font-medium">${response.initial_cost}</span>
              </div>
              <div>
                Potential return:{" "}
                <span className="font-medium">${response.monetary_return}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button
                type="button"
                onClick={handleAccept}
                className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 flex-1"
                disabled={response.initial_cost > availableFunds}
              >
                {response.initial_cost > availableFunds
                  ? "Insufficient Funds"
                  : "Accept & Implement"}
              </Button>

              <Button
                type="button"
                onClick={handleDeny}
                variant="outline"
                className="px-4 py-2 rounded-md font-medium hover:bg-gray-100 border flex-1"
              >
                Cancel Initiative
              </Button>
            </div>

            {response.initial_cost > availableFunds && (
              <div className="mt-3 text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                You need ${response.initial_cost - availableFunds} more to
                implement this initiative.
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

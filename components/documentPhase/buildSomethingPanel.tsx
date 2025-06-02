"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResponseTypes, LogData } from "@/types";
import { TemplateRenderer } from "./templates/templateCompontents";
import { CardComponent } from "@/types/templates";

export type DocumentUpdate = {
  document: "Marketing" | "Product Development" | "Management";
  component: CardComponent;
};

export type BuildResponse = {
  tone: "negative" | "neutral" | "positive";
  type: ResponseTypes;
  result: {
    reason?: string;
    marketing?: CardComponent;
    product?: CardComponent;
    management?: CardComponent;
    log: {
      title: string;
      content: string;
      cost: number;
      monetary_return: number;
    };
    progressUpdates?: {
      templateId: string; // ID of the template to update
      newCheckpointIndex: number; // New index to set for the progress bar
      reason: string; // Reason for the update, used for logging
    }[];
  };
};

interface BuildSomethingPanelProps {
  onComplete: (result: {
    title: string;
    content: React.ReactNode;
    effect: "negative" | "neutral" | "positive";
    accepted: boolean;
    cost: number;
    return: number;
    management?: JSX.Element[];
    marketing?: JSX.Element[];
    product?: JSX.Element[];
  }) => void;
  updateCompanyValue: (value: number) => void;
  companyValue: number;
  businessPlan: LogData | null;
}

export function BuildSomethingPanel({
  onComplete,
  companyValue,
  businessPlan,
  updateCompanyValue,
}: BuildSomethingPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BuildResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasDecided, setHasDecided] = useState(false);

  useEffect(() => {
    console.log("Has decided state updated:", hasDecided);
  }, [hasDecided]);

  useEffect(() => {
    if (response) {
      console.log("Response state updated:", response);
    }
  }, [response]);

  // Function to collect all component interactions from the page
  const collectComponentInteractions = () => {
    const interactions = {
      cardSelections: [] as {
        componentIndex: number;
        componentTitle: string;
        selectedCard: { title: string; description: string };
      }[],
      progressStates: [] as {
        componentIndex: number;
        title: string;
        currentProgress: number;
        totalSteps: number;
        progressPercentage: number;
      }[],
      timestamp: new Date().toISOString(),
    };

    // Find all card choice components and their selections
    const cardComponents = document.querySelectorAll(
      '[data-component-type="card-choice"]'
    );
    cardComponents.forEach((element, index) => {
      const selectedCard = element.querySelector('[data-selected="true"]');
      if (selectedCard) {
        interactions.cardSelections.push({
          componentIndex: index,
          componentTitle: element.querySelector("h2")?.textContent || "Unknown",
          selectedCard: {
            title: selectedCard.querySelector("h3")?.textContent || "Unknown",
            description:
              selectedCard.querySelector("p")?.textContent || "Unknown",
          },
        });
      }
    });

    // Find all progress bar components and their states
    const progressComponents = document.querySelectorAll(
      '[data-component-type="progress-bar"]'
    );
    progressComponents.forEach((element, index) => {
      const title = element.querySelector("h3")?.textContent || "Unknown";
      const progressText =
        element.querySelector("[data-progress]")?.textContent || "0/0";
      const [current, total] = progressText
        .split("/")
        .map((s) => parseInt(s.trim()) || 0);

      interactions.progressStates.push({
        componentIndex: index,
        title,
        currentProgress: current,
        totalSteps: total,
        progressPercentage: total > 0 ? (current / total) * 100 : 0,
      });
    });

    return interactions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const content = businessPlan
        ? businessPlan.content
        : "NO BUSINESS PLAN GIVEN";

      // Collect previous build logs to provide context
      const buildLogs = Array.from(
        document.querySelectorAll('[data-type="market-research"]')
      )
        .map((el) => el.textContent)
        .join("\n\n");

      const componentInteractions = collectComponentInteractions();

      const interactionsText =
        `CARD SELECTIONS:${componentInteractions.cardSelections
          .map(
            (selection) =>
              `- ${selection.componentTitle}: Selected "${selection.selectedCard.title}" - ${selection.selectedCard.description}`
          )
          .join("\n")}
          CURRENT PROGRESS:${componentInteractions.progressStates
            .map(
              (progress) =>
                `- ${progress.title}: ${progress.currentProgress}/${
                  progress.totalSteps
                } (${Math.round(progress.progressPercentage)}%)`
            )
            .join("\n")}
      `.trim();

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
              content: prompt,
            },
          ],
          content,
          buildLogs,
          componentInteractions: interactionsText,
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
      setError("There was an error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!response || !response.result.log) return;
    setHasDecided(true);
    updateCompanyValue(-(response.result.log.cost + 10));

    // NEW: Handle progress updates if provided
    if (response.result.progressUpdates) {
      response.result.progressUpdates.forEach((update) => {
        // Find progress bar components and update them
        const progressComponents = document.querySelectorAll(
          '[data-component-type="progress-bar"]'
        );
        progressComponents.forEach((element, index) => {
          const title = element.querySelector("h3")?.textContent || "";
          if (
            title.includes(update.templateId) ||
            index.toString() === update.templateId
          ) {
            // Update the progress (you'd need to implement this based on your component structure)
            console.log(
              `Updating progress for ${title} to ${update.newCheckpointIndex}: ${update.reason}`
            );
          }
        });
      });
    }

    onComplete({
      title: response.result.log.title,
      content: (
        <div className="space-y-4" key={response.result.log.title}>
          {/* Your existing content rendering */}
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
            <p className="font-bold mb-2">Business Decision:</p>
            <p className="mb-4">{prompt}</p>
          </div>

          <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded">
            <p className="font-bold mb-2">Outcome:</p>
            <p className="mb-2">{response.result.log.content}</p>
          </div>

          {/* Show progress updates if any */}
          {response.result.progressUpdates &&
            response.result.progressUpdates.length > 0 && (
              <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded">
                <p className="font-bold mb-2">Progress Updates:</p>
                {response.result.progressUpdates.map((update, index) => (
                  <p key={index} className="text-sm">
                    • {update.reason}
                  </p>
                ))}
              </div>
            )}

          <div className="grid grid-cols-3 gap-4 mt-4">
            {response.result.product && (
              <div className="p-3 border rounded-md bg-blue-50">
                <div className="text-xs font-semibold text-blue-700 mb-2">
                  PRODUCT
                </div>
                <TemplateRenderer template={response.result.product} />
              </div>
            )}

            {response.result.marketing && (
              <div className="p-3 border rounded-md bg-green-50">
                <div className="text-xs font-semibold text-green-700 mb-2">
                  MARKETING
                </div>
                <TemplateRenderer template={response.result.marketing} />
              </div>
            )}

            {response.result.management && (
              <div className="p-3 border rounded-md bg-purple-50">
                <div className="text-xs font-semibold text-purple-700 mb-2">
                  MANAGEMENT
                </div>
                <TemplateRenderer template={response.result.management} />
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between text-sm border-t pt-4">
            <span>
              Investment: ${response.result.log.cost.toLocaleString()}
            </span>
            <span>
              Expected Return: $
              {response.result.log.monetary_return.toLocaleString()}
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
      management: response.result.management
        ? [<TemplateRenderer template={response.result.management} />]
        : undefined,
      product: response.result.product
        ? [<TemplateRenderer template={response.result.product} />]
        : undefined,
      marketing: response.result.marketing
        ? [<TemplateRenderer template={response.result.marketing} />]
        : undefined,
      effect: response.tone,
      accepted: true,
      cost: response.result.log.cost,
      return: response.result.log.monetary_return,
    });
  };

  // if deny, nothing happens, just log the decision
  const handleDeny = () => {
    if (!response) return;
    setHasDecided(true);

    onComplete({
      title: response.result.log.title,
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
      effect: response.tone,
      accepted: false,
      cost: 0,
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
          onChange={(e) => {
            if (e.target.value.length < 500) {
              setPrompt(e.target.value);
              if (response) setResponse(null);
            }
          }}
          placeholder="I want to build..."
          className="border rounded-md p-3 w-full h-32 resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          disabled={isLoading}
        />

        <Button
          type="submit"
          className={cn(
            "px-4 py-2 rounded-md font-medium text-white",
            "relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500",
            "hover:bg-blue-700 transition duration-200"
          )}
          disabled={!prompt.trim() || isLoading || response !== null}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Analyzing your business decision...
            </span>
          ) : (
            "Build!"
          )}
        </Button>

        {response && response.type == ResponseTypes.ACCEPTED ? (
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              {getOutcomeIcon(response.tone)}
              <h3 className="font-medium text-lg">
                {response.result.log.title}
              </h3>
            </div>

            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <div>
                Initial investment:{" "}
                <span className="font-medium">
                  ${response.result.log.cost + Math.floor(Math.random() * 1000)}
                </span>
              </div>
              <div>
                Potential return:{" "}
                <span className="font-medium">
                  ${response.result.log.monetary_return}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button
                type="button"
                onClick={handleAccept}
                className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 flex-1"
                disabled={response.result.log.cost > companyValue || hasDecided}
              >
                {response.result.log.cost > companyValue
                  ? "Insufficient Funds"
                  : "Accept & Implement"}
              </Button>

              <Button
                type="button"
                onClick={handleDeny}
                variant="outline"
                disabled={hasDecided}
                className="px-4 py-2 rounded-md font-medium hover:bg-gray-100 border flex-1"
              >
                Cancel Initiative
              </Button>
            </div>

            {response.result.log.cost > companyValue && (
              <div className="mt-3 text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                You need ${response.result.log.cost - companyValue} more to
                implement this initiative.
              </div>
            )}
          </div>
        ) : (
          response && (
            <div className="mt-3 p-3 rounded bg-red-100 border border-red-400 text-red-700 text-sm font-medium flex items-center gap-2">
              <svg
                className="w-4 h-4 text-red-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01"
                />
              </svg>
              {response.result.reason}
            </div>
          )
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

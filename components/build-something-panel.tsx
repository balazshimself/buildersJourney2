// "use client";

// import { useState } from "react";
// import { Loader2 } from "lucide-react";
// import { cn } from "@/lib/utils";

// type BuildResponse = {
//   expectedEffect: "negative" | "neutral" | "positive";
//   initialCost: number;
//   monetaryReturn: number;
//   result: string;
// };

// interface BuildSomethingPanelProps {
//   onComplete: (result: {
//     title: string;
//     content: React.ReactNode;
//     effect: "negative" | "neutral" | "positive";
//     cost: number;
//     return: number;
//   }) => void;
//   availableFunds: number;
// }

// export function BuildSomethingPanel({
//   onComplete,
//   availableFunds,
// }: BuildSomethingPanelProps) {
//   const [prompt, setPrompt] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [response, setResponse] = useState<BuildResponse | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!prompt.trim() || isLoading) return;

//     setIsLoading(true);
//     setError(null);

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           messages: [
//             {
//               role: "system",
//               content:
//                 "You are an AI assistant for a business simulation game. Your role is to evaluate business decisions and generate realistic outcomes based on user input.",
//             },
//             {
//               role: "user",
//               content: `As a startup founder, I want to: ${prompt}. Please evaluate this business decision and provide an outcome.`,
//             },
//           ],
//         }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || "Failed to get response");
//       }

//       const data = await res.json();

//       // Process the AI response into our expected format
//       const buildResponse: BuildResponse = {
//         expectedEffect: data.tone as "negative" | "neutral" | "positive",
//         initialCost: Math.floor(Math.random() * 1000) + 500, // Generate a random cost between 500-1500
//         monetaryReturn:
//           data.tone === "positive"
//             ? Math.floor(Math.random() * 3000) + 1000
//             : data.tone === "neutral"
//             ? Math.floor(Math.random() * 1000) + 500
//             : Math.floor(Math.random() * 500),
//         result: data.chat_response,
//       };

//       setResponse(buildResponse);
//     } catch (error) {
//       console.error("Error calling AI endpoint:", error);
//       setError("Sorry, there was an error processing your request.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAccept = () => {
//     if (!response) return;

//     onComplete({
//       title: prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt,
//       content: (
//         <div className="p-4">
//           <p className="font-bold mb-2">Business Decision:</p>
//           <p className="mb-4">{prompt}</p>
//           <p className="font-bold mb-2">Outcome:</p>
//           <p className="mb-2">{response.result}</p>
//           <div className="mt-4 flex justify-between text-sm">
//             <span>Investment: ${response.initialCost}</span>
//             <span>Return: ${response.monetaryReturn}</span>
//             <span
//               className={cn(
//                 "font-semibold",
//                 response.expectedEffect === "positive"
//                   ? "text-green-600"
//                   : response.expectedEffect === "negative"
//                   ? "text-red-600"
//                   : "text-yellow-600"
//               )}
//             >
//               {response.expectedEffect.charAt(0).toUpperCase() +
//                 response.expectedEffect.slice(1)}{" "}
//               outcome
//             </span>
//           </div>
//         </div>
//       ),
//       effect: response.expectedEffect,
//       cost: response.initialCost,
//       return: response.monetaryReturn,
//     });
//   };

//   const handleDeny = () => {
//     if (!response) return;

//     onComplete({
//       title: prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt,
//       content: (
//         <div className="p-4">
//           <p className="font-bold mb-2">Business Decision (Canceled):</p>
//           <p>{prompt}</p>
//           <p className="mt-4 text-gray-500 italic">
//             You decided not to pursue this initiative.
//           </p>
//         </div>
//       ),
//       effect: "neutral",
//       cost: Math.floor(response.initialCost / 10), // Only 1/10th of initial cost
//       return: 0,
//     });
//   };

//   const effectColor =
//     response?.expectedEffect === "positive"
//       ? "text-green-600"
//       : response?.expectedEffect === "negative"
//       ? "text-red-600"
//       : "text-yellow-600";

//   return (
//     <div className="space-y-4">
//       <p className="text-gray-700">
//         Since you have a plan, why don't you start acting on it? Build something
//         or do some research to move your business forward!
//       </p>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <textarea
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="Describe what you want to build or research in detail..."
//           className="border rounded-md p-3 w-full h-32 resize-none"
//           disabled={isLoading || !!response}
//         />

//         <div className="flex items-center space-x-4">
//           {!response ? (
//             <button
//               type="submit"
//               className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-300"
//               disabled={!prompt.trim() || isLoading}
//             >
//               {isLoading ? (
//                 <span className="flex items-center">
//                   <Loader2 className="animate-spin mr-2 h-4 w-4" />
//                   Processing...
//                 </span>
//               ) : (
//                 "Build!"
//               )}
//             </button>
//           ) : (
//             <>
//               <button
//                 type="button"
//                 onClick={handleAccept}
//                 className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700"
//               >
//                 Accept (${response.initialCost})
//               </button>
//               <button
//                 type="button"
//                 onClick={handleDeny}
//                 className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700"
//               >
//                 Deny
//               </button>
//             </>
//           )}

//           {response && (
//             <span className={`ml-2 font-medium ${effectColor}`}>
//               Expected:{" "}
//               {response.expectedEffect.charAt(0).toUpperCase() +
//                 response.expectedEffect.slice(1)}
//               {response.initialCost > availableFunds && (
//                 <span className="text-red-600 ml-2">(Insufficient funds!)</span>
//               )}
//             </span>
//           )}
//         </div>

//         {error && <p className="text-red-600">{error}</p>}

//         {!isLoading && response?.initialCost && (
//           <div className="mt-2 text-sm text-gray-600">
//             <p>
//               Initial cost: ${response.initialCost} ($
//               {Math.floor(response.initialCost / 10)} for research only)
//             </p>
//             {response.monetaryReturn > 0 && (
//               <p>Potential return: ${response.monetaryReturn}</p>
//             )}
//           </div>
//         )}
//       </form>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type BuildResponse = {
  expectedEffect: "negative" | "neutral" | "positive";
  initialCost: number;
  monetaryReturn: number;
  result: string;
  title?: string; // Add title field
};

interface BuildSomethingPanelProps {
  onComplete: (result: {
    title: string;
    content: React.ReactNode;
    effect: "negative" | "neutral" | "positive";
    accepted: boolean;
    cost: number;
    return: number;
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
              content: `As a startup founder, I want to: ${prompt}. Please evaluate this business decision and provide an outcome. Also suggest a short, catchy title for this project (15 characters max).`,
            },
          ],
          businessPlan: businessPlan,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await res.json();

      // Process the AI response into our expected format
      const buildResponse: BuildResponse = {
        expectedEffect: data.tone as "negative" | "neutral" | "positive",
        initialCost: Math.floor(Math.random() * 1000) + 500, // Generate a random cost between 500-1500
        monetaryReturn:
          data.tone === "positive"
            ? Math.floor(Math.random() * 3000) + 1000
            : data.tone === "neutral"
            ? Math.floor(Math.random() * 1000) + 500
            : Math.floor(Math.random() * 500),
        result: data.chat_response,
        title: data.title || generateTitle(prompt), // Use AI title or generate one
      };

      setResponse(buildResponse);
    } catch (error) {
      console.error("Error calling AI endpoint:", error);
      setError("Sorry, there was an error processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback title generator if API doesn't provide one
  const generateTitle = (prompt: string): string => {
    // Generate a title based on the first few words of prompt
    const words = prompt.split(" ").filter((w) => w.length > 3);
    const randomIndex = Math.floor(Math.random() * Math.min(words.length, 3));
    const baseWord = words[randomIndex] || "Project";

    // Add a random prefix
    const prefixes = ["Pro", "New", "Smart", "Swift", "Agile", "Next", "Rapid"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    return `${prefix} ${baseWord}`.substring(0, 15);
  };

  const handleAccept = () => {
    if (!response) return;

    // AI-generated or fallback title
    const projectTitle = response.title || generateTitle(prompt);

    onComplete({
      title: projectTitle,
      content: (
        <div className="p-4">
          <p className="font-bold mb-2">Business Decision:</p>
          <p className="mb-4">{prompt}</p>
          <p className="font-bold mb-2">Outcome:</p>
          <p className="mb-2">{response.result}</p>
          <div className="mt-4 flex justify-between text-sm">
            <span>Investment: ${response.initialCost}</span>
            <span>Return: ${response.monetaryReturn}</span>
            <span
              className={cn(
                "font-semibold",
                response.expectedEffect === "positive"
                  ? "text-green-600"
                  : response.expectedEffect === "negative"
                  ? "text-red-600"
                  : "text-yellow-600"
              )}
            >
              {response.expectedEffect.charAt(0).toUpperCase() +
                response.expectedEffect.slice(1)}{" "}
              outcome
            </span>
          </div>
        </div>
      ),
      effect: response.expectedEffect,
      accepted: true, // Mark as accepted
      cost: response.initialCost,
      return: response.monetaryReturn,
    });
  };

  const handleDeny = () => {
    if (!response) return;

    // AI-generated or fallback title for denied projects too
    const projectTitle = response.title || generateTitle(prompt);

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
      effect: response.expectedEffect, // Keep the effect type
      accepted: false, // Mark as not accepted
      cost: 0, // No cost for denied projects
      return: 0,
    });
  };

  const effectColor =
    response?.expectedEffect === "positive"
      ? "text-green-600"
      : response?.expectedEffect === "negative"
      ? "text-red-600"
      : "text-yellow-600";

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
          disabled={isLoading || !!response}
        />

        <div className="flex items-center space-x-4">
          {!response ? (
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
                className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700"
              >
                Accept (${response.initialCost})
              </button>
              <button
                type="button"
                onClick={handleDeny}
                className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700"
              >
                Deny
              </button>
            </>
          )}

          {response && (
            <span className={`ml-2 font-medium ${effectColor}`}>
              Expected:{" "}
              {response.expectedEffect.charAt(0).toUpperCase() +
                response.expectedEffect.slice(1)}
              {response.initialCost > availableFunds && (
                <span className="text-red-600 ml-2">(Insufficient funds!)</span>
              )}
            </span>
          )}
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {!isLoading && response?.initialCost && (
          <div className="mt-2 text-sm text-gray-600">
            <p>Initial cost: ${response.initialCost}</p>
            {response.monetaryReturn > 0 && (
              <p>Potential return: ${response.monetaryReturn}</p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

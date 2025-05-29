"use client";

import { useEffect, useState } from "react";
import { Problem } from "@/types";
import { OptimizedTimer } from "@/components/ui/optimizedTimer";
import { Button } from "@/components/ui/button";

interface ProblemPhaseProps {
  problem: Problem;
  userSolution: string;
  timer: number;
  onSolutionChange: (solution: string) => void;
  onEvaluate: (solution: string, previousPrompts?: string[]) => void;
  testEvaluate?: () => void;
  onTimerChange: (time: number) => void;
  rejectionReason?: string;
  isLoading: boolean;
}

export function ProblemPhase({
  problem,
  userSolution,
  timer,
  onSolutionChange,
  onEvaluate,
  testEvaluate,
  onTimerChange,
  rejectionReason,
  isLoading: isValidating,
}: ProblemPhaseProps) {
  const [previousPrompts, setPreviousPrompts] = useState<string[]>([]);

  useEffect(() => {
    if (timer === 0 && !isValidating) {
      onEvaluate(userSolution, previousPrompts);
    }
  }, [timer, userSolution, onEvaluate]);

  useEffect(() => {
    console.log("Previous prompts updated:", previousPrompts);
  }, [previousPrompts]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4 flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Problem Statement</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={testEvaluate}
            className="text-sm"
          >
            Dev Skip
          </Button>
          <OptimizedTimer
            initialTime={timer}
            autoStart={true}
            onComplete={() => {
              onEvaluate(userSolution, previousPrompts);
              setPreviousPrompts((prev) => [...prev, userSolution]);
            }}
            onTimeChange={onTimerChange}
            className="min-w-28"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 flex-grow overflow-hidden">
        {/* Problem Statement */}
        <div className="bg-white rounded-lg shadow-md p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">
            {problem.title}
          </h2>
          <p className="text-gray-800 text-sm mb-6">{problem.description}</p>

          <h3 className="text-base font-medium mb-3">Market Analysis</h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="text-gray-700 text-sm whitespace-pre-line">
              {problem.marketAnalysis}
            </p>
          </div>
        </div>

        {/* Solution Input */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Your Business Plan</h2>

          <textarea
            value={userSolution}
            onChange={(e) => onSolutionChange(e.target.value)}
            disabled={isValidating}
            placeholder="Write your business plan here. Be thoughtful and consider all aspects of the problem. 
            Your response will be evaluated for soundness and creativity."
            className="flex-grow p-4 border border-gray-300 rounded-md resize-none text-sm"
          />

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {userSolution.length} characters
            </div>
            <Button
              onClick={() => {
                onEvaluate(userSolution);
                setPreviousPrompts((prev) => [...prev, userSolution]);
              }}
              disabled={userSolution.trim().length === 0 || isValidating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Plan
            </Button>
          </div>
        </div>
      </div>
      {rejectionReason && (
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
          {rejectionReason}
        </div>
      )}
    </div>
  );
}

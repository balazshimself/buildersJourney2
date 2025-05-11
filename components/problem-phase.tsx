"use client";

import { useEffect } from "react";
import { Problem } from "@/types";
import { Timer } from "@/components/ui/timer";
import { Button } from "@/components/ui/button";

interface ProblemPhaseProps {
  problem: Problem;
  userSolution: string;
  timer: number;
  onSolutionChange: (solution: string) => void;
  onEvaluate: () => void;
  onTimerChange: (time: number) => void;
}

export function ProblemPhase({
  problem,
  userSolution,
  timer,
  onSolutionChange,
  onEvaluate,
  onTimerChange,
}: ProblemPhaseProps) {
  // Auto-submit when time runs out
  useEffect(() => {
    if (timer === 0 && userSolution.trim().length > 0) {
      onEvaluate();
    }
  }, [timer, userSolution, onEvaluate]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4 flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Problem Statement</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEvaluate}
            className="text-sm"
          >
            Dev Skip
          </Button>
          <Timer
            initialTime={timer}
            autoStart={true}
            onComplete={onEvaluate}
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
            placeholder="Write your business plan here. Be thoughtful and consider all aspects of the problem. 
            Your response will be evaluated for soundness and creativity."
            className="flex-grow p-4 border border-gray-300 rounded-md resize-none text-sm"
          />

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {userSolution.length} characters
            </div>
            <Button
              onClick={onEvaluate}
              disabled={userSolution.trim().length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

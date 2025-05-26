"use client";

import { useAppState } from "@/hooks/useAppState";
import { RulesPhase } from "@/components/rulesPhase";
import { ProblemPhase } from "@/components/problemPhase";
import { DocumentPhase } from "@/components/documentPhase/documentPhase";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EvaluationPhase } from "@/components/evaluationPhase";
import { useEffect, useState } from "react";

export default function Home() {
  const {
    state,
    startProblemPhase,
    testEvaluate,
    evaluateSolution,
    startEvaluationPhase,
    addDocument,
    updateDocument,
    updateTimer,
    setTimeline,
  } = useAppState();

  const [userSolution, setUserSolution] = useState<string>("");

  // Render appropriate phase based on current app state
  const renderPhase = () => {
    switch (state.currentPhase) {
      case "rules":
        return <RulesPhase onStart={startProblemPhase} />;

      case "problem":
        return (
          <ProblemPhase
            problem={state.currentProblem!}
            userSolution={userSolution}
            timer={state.timer}
            onSolutionChange={setUserSolution}
            onEvaluate={evaluateSolution}
            testEvaluate={testEvaluate}
            onTimerChange={updateTimer}
            rejectionReason={state.rejectionReason}
            isLoading={state.isLoading}
          />
        );

      case "document":
        return (
          <SidebarProvider>
            <DocumentPhase
              logs={state.logs}
              businessPlan={state.businessPlan}
              timer={state.timer}
              timeline={state.timeline}
              onUpdateDocument={updateDocument}
              onAddDocument={addDocument}
              onTimerChange={updateTimer}
              setTimeLine={setTimeline}
              startEvaluationPhase={startEvaluationPhase}
            />
          </SidebarProvider>
        );
      case "evaluation":
        return (
          <EvaluationPhase
            logs={state.logs}
            businessPlan={state.businessPlan}
            companyValue={state.companyValue || 5000}
          />
        );
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      {renderPhase()}
    </main>
  );
}

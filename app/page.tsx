"use client";

import { useAppState } from "@/hooks/useAppState";
import { RulesPhase } from "@/components/rulesPhase";
import { ProblemPhase } from "@/components/problemPhase";
import { DocumentPhase } from "@/components/documentPhase/documentPhase";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  const {
    state,
    startProblemPhase,
    testEvaluate,
    updateUserSolution,
    evaluateSolution,
    startEvaluationPhase,
    addDocument,
    updateDocument,
    updateTimer,
    setTimeline,
  } = useAppState();

  // Render appropriate phase based on current app state
  const renderPhase = () => {
    switch (state.currentPhase) {
      case "rules":
        return <RulesPhase onStart={startProblemPhase} />;

      case "problem":
        return (
          <ProblemPhase
            problem={state.currentProblem!}
            userSolution={state.userInput}
            timer={state.timer}
            onSolutionChange={updateUserSolution}
            onEvaluate={evaluateSolution}
            testEvaluate={testEvaluate}
            onTimerChange={updateTimer}
            rejectionReason={state.rejectionReason}
            isValidating={state.isValidating}
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
        return <div>Thanks for playing! Here is your evaluation: </div>;
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

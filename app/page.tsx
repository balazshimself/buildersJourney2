"use client";

import { useAppState } from "@/hooks/useAppState";
import { RulesPhase } from "@/components/rulesPhase/rulesPhase";
import { ProblemPhase } from "@/components/problemPhase/problemPhase";
import { DocumentPhase } from "@/components/documentPhase/documentPhase";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EvaluationPhase } from "@/components/evaluationPhase/evaluationPhase";
import { useState } from "react";
import Script from "next/script";

// Add type definitions for the Frappe Gantt library
declare global {
  interface Window {
    Gantt: any;
  }
}

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
    updateCompanyValue,
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
              timer={state.timer}
              businessPlan={state.businessPlan}
              companyValue={state.companyValue}
              onAddDocument={addDocument}
              onTimerChange={updateTimer}
              onUpdateDocument={updateDocument}
              startEvaluationPhase={startEvaluationPhase}
              updateCompanyValue={updateCompanyValue}
            />
            {/* Load Frappe Gantt script and styles */}
            <Script
              src="https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.min.js"
              // onLoad={() => setIsLibraryLoaded(true)}
            />
            <link
              rel="stylesheet"
              href="https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.min.css"
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

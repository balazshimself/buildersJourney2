"use client";

import { useAppState } from "@/hooks/useAppState";
import { RulesPhase } from "@/components/rulesPhase/rulesPhase";
import { ProblemPhase } from "@/components/problemPhase/problemPhase";
import { DocumentPhase } from "@/components/documentPhase/documentPhase";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EvaluationPhase } from "@/components/evaluationPhase/evaluationPhase";
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
    submittedBusinessPlans,
    startProblemPhase,
    testEvaluate,
    evaluateSolution,
    startEvaluationPhase,
    addDocument,
    updateDocument,
    updateCompanyValue,
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
            onEvaluate={evaluateSolution}
            testEvaluate={testEvaluate}
            sectionFeedback={state.sectionFeedback}
          />
        );

      case "document":
        return (
          <SidebarProvider>
            <DocumentPhase
              marketingCards={state.marketingCards[0]}
              productCards={state.productCards[0]}
              managementCards={state.managementCards[0]}
              logs={state.logs}
              businessPlan={state.businessPlan}
              companyValue={state.companyValue}
              onAddDocument={addDocument}
              onUpdateDocument={updateDocument}
              startEvaluationPhase={startEvaluationPhase}
              updateCompanyValue={updateCompanyValue}
            />
            <Script src="https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.min.js" />
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
            rejectedPlans={submittedBusinessPlans}
            businessPlan={state.businessPlan}
            problemStatement={
              state.currentProblem?.sections.problemOverview.desc
            }
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

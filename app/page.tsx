'use client';

import { useEffect } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { RulesPhase } from '@/components/rules-phase';
import { ProblemPhase } from '@/components/problem-phase';
import { DocumentPhase } from '@/components/document-phase';

export default function Home() {
  const {
    state,
    startProblemPhase,
    updateUserSolution,
    evaluateSolution,
    addDocument,
    updateDocument,
    removeDocument,
    toggleDocumentVisibility,
    updateTimer,
    addNotification,
  } = useAppState();

  // Render appropriate phase based on current app state
  const renderPhase = () => {
    switch (state.currentPhase) {
      case 'rules':
        return (
          <RulesPhase onStart={startProblemPhase} />
        );
      
      case 'problem':
        return (
          <ProblemPhase
            problem={state.currentProblem!}
            userSolution={state.userSolution}
            timer={state.timer}
            onSolutionChange={updateUserSolution}
            onEvaluate={evaluateSolution}
            onTimerChange={updateTimer}
          />
        );
      
      case 'document':
        return (
          <DocumentPhase
            documents={state.documents}
            timer={state.timer}
            onUpdateDocument={updateDocument}
            onAddDocument={addDocument}
            onRemoveDocument={removeDocument}
            onToggleVisibility={toggleDocumentVisibility}
            onTimerChange={updateTimer}
            onAddNotification={addNotification}
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
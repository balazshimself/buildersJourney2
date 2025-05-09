'use client';

import { Button } from '@/components/ui/button';

interface RulesPhaseProps {
  onStart: () => void;
}

export function RulesPhase({ onStart }: RulesPhaseProps) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-center mb-8">
        YC Interview Simulation
      </h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-4">How This Works</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-blue-700 mb-2">1. The Problem Statement</h3>
            <p className="text-gray-700">
              You'll be presented with a business problem similar to what you might encounter
              in a YC interview. Each problem includes a detailed market analysis to help
              inform your thinking.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-blue-700 mb-2">2. Brainstorming (3-5 minutes)</h3>
            <p className="text-gray-700">
              You'll have 3-5 minutes to analyze the problem and draft a business plan.
              Write your ideas in the provided text area. Be thorough - this will be evaluated
              for soundness and creativity.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-blue-700 mb-2">3. Document Phase</h3>
            <p className="text-gray-700">
              If your solution passes the evaluation, you'll receive a formalized version of your
              business plan and a project timeline. You'll have a brief preparation time before
              market updates start arriving.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-blue-700 mb-2">4. Adapt and Succeed</h3>
            <p className="text-gray-700">
              As new information arrives in the form of market research, competitor analysis,
              and other documents, you'll need to adjust your plan to ensure your business
              remains viable. Drag documents around, hide or show them as needed, and
              edit your plans to respond to changing conditions.
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Button 
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-md transition-all transform hover:scale-105"
        >
          Begin Interview Simulation
        </Button>
      </div>
    </div>
  );
}
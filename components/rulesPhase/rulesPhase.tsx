// "use client";

// import { Button } from "@/components/ui/button";

// interface RulesPhaseProps {
//   onStart: () => void;
// }

// export function RulesPhase({ onStart }: RulesPhaseProps) {
//   return (
//     <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-500">
//       <h1 className="text-3xl font-bold text-center mb-8">
//         Builder's Journey, a simulation
//       </h1>

//       <div className="bg-white shadow-lg rounded-lg p-6 mb-10">
//         <h2 className="text-2xl font-semibold mb-4">How This Works</h2>

//         <div className="space-y-6">
//           <div>
//             <h3 className="text-lg font-medium text-blue-700 mb-2">
//               1. The Problem Statement
//             </h3>
//             <p className="text-gray-700">
//               You'll be presented with a business problem, based on which you
//               will need to create a simulated business. Each problem includes a
//               detailed market analysis to help inform your thinking.
//             </p>
//           </div>

//           <div>
//             <h3 className="text-lg font-medium text-blue-700 mb-2">
//               2. Brainstorming (3-5 minutes)
//             </h3>
//             <p className="text-gray-700">
//               You'll have 3-5 minutes to analyze the problem and draft a
//               business plan. Write your ideas in the provided text area. Be
//               thorough - this will be evaluated for soundness and creativity.
//             </p>
//           </div>

//           <div>
//             <h3 className="text-lg font-medium text-blue-700 mb-2">
//               3. Document Phase
//             </h3>
//             <p className="text-gray-700">
//               If your solution passes the evaluation, you'll receive a
//               formalized version of your business plan and a project timeline.
//               You'll have a brief preparation time before market updates start
//               arriving.
//             </p>
//           </div>

//           <div>
//             <h3 className="text-lg font-medium text-blue-700 mb-2">
//               4. Adapt and Succeed
//             </h3>
//             <p className="text-gray-700">
//               As new information arrives in the form of market research,
//               competitor analysis, and other documents, you'll need to adjust
//               your plan to ensure your business remains viable. Drag documents
//               around, hide or show them as needed, and edit your plans to
//               respond to changing conditions.
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="text-center">
//         <Button
//           onClick={onStart}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-md transition-all transform hover:scale-105"
//         >
//           Begin Interview Simulation
//         </Button>
//       </div>
//     </div>
//   );
// }

import { Button } from "@/components/ui/button";

interface RulesPhaseProps {
  onStart: () => void;
}

export function RulesPhase({ onStart }: RulesPhaseProps) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          builder's journey.
        </h1>
        <p className="text-xl text-gray-600">
          Turn an idea into a business, gamified and AI-powered.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Left side - The Challenge */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl border border-blue-200">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
            The Challenge
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Spot the opportunity:</strong> Analyze a real market gap
              and understand what's missing
            </p>
            <p>
              <strong>Create your plan:</strong> Draft a business strategy in 5
              minutes (AI will evaluate for realism)
            </p>
            <p>
              <strong>Start with $5,000:</strong> Every decision costs
              money—spend wisely
            </p>
          </div>
        </div>

        {/* Right side - The Execution */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl border border-green-200">
          <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center">
            Build & Adapt
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Make it real:</strong> Build prototypes, launch campaigns,
              hire team members
            </p>
            <p>
              <strong>AI feedback loop:</strong> Every action gets realistic
              consequences—good or bad
            </p>
            <p>
              <strong>Reach $100K:</strong> Scale your company value through
              smart decisions
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
          What makes this unique?
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">🧠</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">
              AI-Powered Reality
            </h4>
            <p className="text-sm text-gray-600">
              Every decision gets evaluated with realistic market consequences
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-orange-600 font-bold">⚡</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Fast-Paced</h4>
            <p className="text-sm text-gray-600">
              Complete business journeys in 30 minutes, not 30 weeks
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-red-600 font-bold">📊</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Real Metrics</h4>
            <p className="text-sm text-gray-600">
              Track product development, marketing impact, and team growth
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Button
          onClick={onStart}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Start your journey
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          Ready to turn an idea into reality? Let's see what you can build.
        </p>
      </div>
    </div>
  );
}

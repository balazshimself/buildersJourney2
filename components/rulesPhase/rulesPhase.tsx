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

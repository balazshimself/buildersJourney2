export type AppPhase = "rules" | "problem" | "document";

export interface Problem {
  id: string;
  title: string;
  description: string;
  marketAnalysis: string;
}

export interface Document {
  id: string;
  type:
    | "business-plan"
    | "timeline"
    | "notification"
    | "market-research"
    | "competitor-analysis"
    | "custom"
    | "event";
  title: string;
  content: React.ReactNode;
  editable: boolean;
  countdown?: number;
  createdAt: Date;
  metadata?: {
    effect?: "positive" | "neutral" | "negative";
    cost?: number;
    return?: number;
    [key: string]: any;
  };
}

export interface AppState {
  currentPhase: AppPhase;
  currentProblem: Problem | null;
  documents: Document[];
  userSolution: string;
  timer: number;
  isPassed: boolean | null;
}

{
  /* Research Form //TODO*/
}
{
  /* {isCreatingDocument && (
        <div className="absolute inset-y-0 left-64 right-0 bg-white">
          <div className="max-w-2xl mx-auto p-6">
            <h3 className="text-lg font-semibold mb-4">Start a New Project</h3>
            <p className="text-gray-600 mb-4">
              Write what you want to do, as if you were explaining it to an
              associate!
            </p>
            <p className="text-gray-600 mb-6">
              Your actions have consequences. Remember, as a business owner the
              more well-thought-out your plan is, the more likely you are to
              succeed.
            </p>

            <textarea
              value={newDocumentTitle}
              onChange={(e) => setNewDocumentTitle(e.target.value)}
              placeholder="Describe your research or prototype plan..."
              className="w-full p-3 text-sm border border-gray-300 rounded-md mb-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingDocument(false);
                  onSelectDocument(documents[0]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDocument}
                disabled={!newDocumentTitle.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Project
              </Button>
            </div>
          </div>
        </div>
      )} */
}

import { useCallback, useState } from "react";
import { AppState, Document, Problem } from "@/types";
import problemsData from "@/data/problems.json";
import { AIResponse } from "@/components/templates/templateCompontents";

const INITIAL_STATE: AppState = {
  currentPhase: "rules",
  currentProblem: null,
  documents: [],
  userSolution: "",
  timer: 0,
  isPassed: null,
  isValidating: false,
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const startProblemPhase = useCallback(() => {
    const randomIndex = Math.floor(
      Math.random() * problemsData.problems.length
    );
    const selectedProblem = problemsData.problems[randomIndex];

    setState({
      ...state,
      currentPhase: "problem",
      currentProblem: selectedProblem,
      timer: 300, // 5 minutes in seconds
      userSolution: "",
      isPassed: null,
      isValidating: false,
    });
  }, [state]);

  const updateUserSolution = useCallback(
    (solution: string) => {
      setState({
        ...state,
        userSolution: solution,
      });
    },
    [state]
  );

  const evaluateSolution = useCallback(async () => {
    // Set validating state
    setState((prevState) => ({
      ...prevState,
      isValidating: true,
    }));

    try {
      // Call API to validate business plan
      const response = await fetch("/api/validate-business-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemStatement: state.currentProblem?.marketAnalysis || "",
          businessPlan: state.userSolution,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to validate business plan");
      }

      const result = await response.json();

      // Use the validated result to start document phase
      startDocumentPhase(result);
    } catch (error) {
      console.error("Error validating solution:", error);
      // Fallback: proceed anyway if validation fails
      const fallbackResponse: AIResponse = {
        type: "accepted",
        content: [
          {
            document: "Product Development",
            component: {
              type: "staticText",
              data: {
                title: "Initial Development Plan",
                text: "Based on your business plan, we'll begin development of the core product features specified. The initial phase will focus on creating a minimum viable product.",
              },
            },
          },
          {
            document: "Marketing",
            component: {
              type: "staticText",
              data: {
                title: "Market Strategy",
                text: "Your target audience has been identified. Initial marketing efforts will focus on building awareness among this demographic through targeted digital channels.",
              },
            },
          },
          {
            document: "Management",
            component: {
              type: "staticText",
              data: {
                title: "Team Structure",
                text: "Your startup will begin with a lean team focused on core development and marketing. Additional specialists will be recruited as needed as the product matures.",
              },
            },
          },
        ],
      };
      startDocumentPhase({
        type: "accepted",
        formalizedPlan: state.userSolution,
        content: fallbackResponse.content,
      });
    }
  }, [state]);

  const startDocumentPhase = useCallback(
    (result: any) => {
      // Extract data based on whether the plan was accepted or rejected
      const isAccepted = result.type === "accepted";
      const formalizedPlan = result.formalizedPlan || state.userSolution;

      // Create the business plan document
      const businessPlan: Document = {
        id: "doc-bp-001",
        type: "business-plan",
        title: "Business Plan",
        content: formalizedPlan,
        editable: true,
        createdAt: new Date(),
        metadata: {
          aiResponse: result, // Store the full AI response for reference
        },
      };

      const timeline: Document = {
        id: "doc-tl-001",
        type: "timeline",
        title: "Project Timeline",
        content: `# Project Timeline\n\nQ2 2025\n- Product design finalization\n- Manufacturing partner selection\n- Initial prototype production\n\nQ3 2025\n- Beta testing program\n- Marketing campaign development\n- Supply chain optimization\n\nQ4 2025\n- Production ramp-up\n- Retail partnership establishment\n- Website and app development\n\nQ1 2026\n- Official product launch\n- Marketing campaign execution\n- Customer support team training`,
        editable: true,
        createdAt: new Date(),
      };

      const marketResearch: Document = {
        id: "doc-mr-001",
        type: "market-research",
        title: "Initial Market Analysis",
        content: `# Market Research Summary\n\n${
          state.currentProblem?.marketAnalysis || ""
        }`,
        editable: true,
        createdAt: new Date(),
      };

      // Add feedback document if rejected
      let documents = [businessPlan, timeline, marketResearch];

      if (!isAccepted) {
        const feedback: Document = {
          id: "doc-feedback-001",
          type: "notification",
          title: "Business Plan Feedback",
          content: `# Advisor Feedback\n\nYour business plan has some concerns, but we'll proceed with development.\n\n## Feedback:\n${result.reason}\n\nPlease consider this feedback as you refine your strategy going forward.`,
          editable: false,
          createdAt: new Date(),
        };
        documents.push(feedback);
      }

      setState({
        ...state,
        currentPhase: "document",
        documents: documents,
        timer: 1800, // 30 minutes in seconds
        isPassed: isAccepted,
        isValidating: false,
      });
    },
    [state]
  );

  const addDocument = useCallback(
    (document: Omit<Document, "id" | "visible" | "createdAt">) => {
      const newDocument: Document = {
        ...document,
        id: `doc-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      setState({
        ...state,
        documents: [...state.documents, newDocument],
      });
    },
    [state]
  );

  const updateDocument = useCallback(
    (id: string, updates: Partial<Document>) => {
      setState({
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, ...updates } : doc
        ),
      });
    },
    [state]
  );

  const removeDocument = useCallback(
    (id: string) => {
      setState({
        ...state,
        documents: state.documents.filter((doc) => doc.id !== id),
      });
    },
    [state]
  );

  const toggleDocumentVisibility = useCallback(
    (id: string) => {
      setState({
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc } : doc
        ),
      });
    },
    [state]
  );

  const updateTimer = useCallback(
    (newTime: number) => {
      setState({
        ...state,
        timer: newTime,
      });
    },
    [state]
  );

  const addNotification = useCallback(
    (notification: Document) => {
      setState({
        ...state,
        documents: [...state.documents, notification],
      });
    },
    [state]
  );

  return {
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
  };
};

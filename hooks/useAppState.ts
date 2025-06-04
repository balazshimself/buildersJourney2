import { useCallback, useState } from "react";
import { AppState, BusinessPlanSection, LogData, Problem } from "@/types";
import problemsData from "@/data/problems.json";

const INITIAL_STATE: AppState = {
  currentPhase: "rules",
  marketingCards: [],
  managementCards: [],
  productCards: [],
  currentProblem: null,
  businessPlan: null,
  logs: [],
  timer: 0,
  sectionFeedback: [],
  isLoading: false,
  companyValue: 5000,
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const startProblemPhase = useCallback(() => {
    const randomIndex = Math.floor(
      Math.random() * problemsData.problems.length
    );
    const selectedProblem: Problem = problemsData.problems[randomIndex];

    setState((prevState) => ({
      ...prevState,
      currentPhase: "problem",
      currentProblem: selectedProblem,
      sectionFeedback: [],
      timer: 300,
      isLoading: false,
    }));
  }, [state]);

  const updateCompanyValue = useCallback(
    (value: number) => {
      console.log("Updating company value by:", value);
      setState((prevState) => ({
        ...prevState,
        companyValue: prevState.companyValue + value,
      }));
    },
    [state]
  );

  const startDocumentPhase = useCallback(
    (result: any) => {
      // Create the business plan document
      const businessPlan: LogData = {
        id: "business-plan",
        title: "Business Plan",
        content: result.formalizedPlan,
        createdAt: new Date(),
        metadata: {
          aiResponse: result,
        },
      };

      setState((prevState) => ({
        ...prevState,
        currentPhase: "document",
        logs: [],
        businessPlan: businessPlan,
        timer: 120,
        sectionFeedback: [],
        isLoading: false,
      }));
    },
    [state]
  );

  const startEvaluationPhase = useCallback(() => {
    setState({
      ...state,
      currentPhase: "evaluation",
      isLoading: false,
    });
  }, [state]);

  const testEvaluate = useCallback(async () => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    try {
      console.log("Skipping the business plan stage.");

      const devPlanData = await import("@/data/devPlan.json");

      startDocumentPhase({
        type: "accepted",
        formalizedPlan: devPlanData.default.plan,
      });
    } catch {}
  }, [state, startDocumentPhase]);

  const evaluateSolution = useCallback(
    async (
      sections: BusinessPlanSection[],
      previousAttempts?: BusinessPlanSection[][]
    ) => {
      setState((prevState) => ({ ...prevState, isLoading: true }));

      try {
        console.log("Evaluating business plan sections:", sections);
        const response = await fetch("/api/validateBusinessPlan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemStatement:
              state.currentProblem?.sections.problemOverview.desc || "",
            businessPlanSections: sections,
            previousAttempts: previousAttempts || [],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to validate business plan");
        }

        const result = await response.json();

        console.log("Validation result:", result);

        if (result.type === "accepted") {
          // Access formalizedPlan from result.response
          startDocumentPhase({
            type: "accepted",
            formalizedPlan: result.response.formalizedPlan,
          });
        } else {
          // Access sectionFeedback from result.response
          setState((prevState) => ({
            ...prevState,
            isLoading: false,
            sectionFeedback: result.response.sectionFeedback || [],
            timer: prevState.timer + 60, // Add extra time for revisions
          }));
        }
      } catch (error) {
        console.error("Error validating solution:", error);
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          sectionFeedback: [
            {
              sectionId: "general",
              isValid: false,
              feedback:
                "Failed to connect to validation service. Please try again.",
            },
          ],
        }));
      }
    },
    [state, startDocumentPhase]
  );

  const addDocument = useCallback(
    (document: Omit<LogData, "id" | "visible" | "createdAt">) => {
      const newDocument: LogData = {
        ...document,
        id: `doc-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      setState((prevState) => ({
        ...prevState,
        logs: [...state.logs, newDocument],
      }));
    },
    [state]
  );

  const updateDocument = useCallback(
    (id: string, updates: Partial<LogData>) => {
      setState((prevState) => ({
        ...prevState,
        logs: state.logs.map((doc) =>
          doc.id === id ? { ...doc, ...updates } : doc
        ),
      }));
    },
    [state]
  );

  const updateTimer = useCallback((newTime: number) => {
    setState((prevState) => ({
      ...prevState,
      timer: newTime,
    }));
  }, []);

  return {
    state,
    startProblemPhase,
    startEvaluationPhase,
    evaluateSolution,
    testEvaluate,
    addDocument,
    updateDocument,
    updateTimer,
    updateCompanyValue,
  };
};

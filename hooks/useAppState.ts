import { useCallback, useState } from "react";
import { AppState, LogData } from "@/types";
import problemsData from "@/data/problems.json";
import { ValidationResponse } from "@/app/api/validateBusinessPlan/route";

const INITIAL_STATE: AppState = {
  currentPhase: "rules",
  marketingCards: [],
  managementCards: [],
  productCards: [],
  currentProblem: null,
  businessPlan: null,
  logs: [],
  timer: 0,
  rejectionReason: undefined,
  isLoading: false,
  companyValue: 5000,
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
      isLoading: false,
    });
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

      setState({
        ...state,
        currentPhase: "document",
        logs: [],
        businessPlan: businessPlan,
        timer: 1000, // 30 minutes in seconds
        isLoading: false,
      });
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
    async (userInput: string, previousPrompts?: string[]) => {
      // Set validating state
      setState((prevState) => ({
        ...prevState,
        isLoading: true,
      }));

      try {
        // Call API to validate business plan
        const response = await fetch("/api/validateBusinessPlan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problemStatement: state.currentProblem?.marketAnalysis || "",
            businessPlan: userInput,
            previousPrompts: previousPrompts || [],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to validate business plan");
        }

        const result: ValidationResponse = await response.json();

        // Check if the plan was rejected
        if (result.type === "accepted") {
          startDocumentPhase(result);
        } else {
          // if not accepted
          setState((prevState) => ({
            ...prevState,
            isLoading: false,
            rejectionReason: result.reason,
            timer: prevState.timer + 60,
          }));
        }
      } catch (error) {
        console.error("Error validating solution:", error);
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          rejectionReason: "Failed to fetch AI response! Please try again.",
          timer: prevState.timer,
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

      setState({
        ...state,
        logs: [...state.logs, newDocument],
      });
    },
    [state]
  );

  const updateDocument = useCallback(
    (id: string, updates: Partial<LogData>) => {
      setState({
        ...state,
        logs: state.logs.map((doc) =>
          doc.id === id ? { ...doc, ...updates } : doc
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

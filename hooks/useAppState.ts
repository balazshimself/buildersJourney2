import { useCallback, useState } from "react";
import { AppState, Document } from "@/types";
import problemsData from "@/data/problems.json";
import { ValidationResponse } from "@/app/api/validateBusinessPlan/route";

const INITIAL_STATE: AppState = {
  currentPhase: "rules",
  currentProblem: null,
  businessPlan: null,
  logs: [],
  userInput: "",
  timer: 0,
  rejectionReason: undefined,
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
      userInput: "",
      isPassed: null,
      isValidating: false,
    });
  }, [state]);

  const updateUserInput = useCallback(
    (solution: string) => {
      setState({
        ...state,
        userInput: solution,
      });
    },
    [state]
  );

  const startDocumentPhase = useCallback(
    (result: any) => {
      // Create the business plan document
      const businessPlan: Document = {
        id: "business-plan",
        title: "Business Plan",
        content: result.formalizedPlan,
        createdAt: new Date(),
        metadata: {
          aiResponse: result, // Store the full AI response for reference
        },
      };

      setState({
        ...state,
        currentPhase: "document",
        logs: [],
        businessPlan: businessPlan,
        timer: 1800, // 30 minutes in seconds
        isValidating: false,
      });
    },
    [state]
  );

  const testEvaluate = useCallback(async () => {
    setState((prevState) => ({
      ...prevState,
      isValidating: true,
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

  const evaluateSolution = useCallback(async () => {
    // Set validating state
    setState((prevState) => ({
      ...prevState,
      isValidating: true,
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
          businessPlan: state.userInput,
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
          isValidating: false,
          rejectionReason: result.reason,
          timer: prevState.timer + 60,
        }));
      }
    } catch (error) {
      console.error("Error validating solution:", error);
      setState((prevState) => ({
        ...prevState,
        isValidating: false,
        rejectionReason: "Failed to fetch AI response! Please try again.",
        timer: prevState.timer,
      }));
    }
  }, [state, startDocumentPhase]);

  const addDocument = useCallback(
    (document: Omit<Document, "id" | "visible" | "createdAt">) => {
      const newDocument: Document = {
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
    (id: string, updates: Partial<Document>) => {
      setState({
        ...state,
        logs: state.logs.map((doc) =>
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
        logs: state.logs.filter((doc) => doc.id !== id),
      });
    },
    [state]
  );

  const toggleDocumentVisibility = useCallback(
    (id: string) => {
      setState({
        ...state,
        logs: state.logs.map((doc) => (doc.id === id ? { ...doc } : doc)),
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
        logs: [...state.logs, notification],
      });
    },
    [state]
  );

  return {
    state,
    startProblemPhase,
    updateUserSolution: updateUserInput,
    evaluateSolution,
    testEvaluate,
    addDocument,
    updateDocument,
    removeDocument,
    toggleDocumentVisibility,
    updateTimer,
    addNotification,
  };
};

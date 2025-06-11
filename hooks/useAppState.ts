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
  sectionFeedback: [],
  companyValue: 5000,
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [submittedBusinessPlans, setSubmittedBusinessPlans] = useState<
    BusinessPlanSection[][]
  >([]);
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
      const marketingCards = result.initialTemplates.marketing
        ? [result.initialTemplates.marketing]
        : [];
      const productCards = result.initialTemplates.product
        ? [result.initialTemplates.product]
        : [];
      const managementCards = result.initialTemplates.management
        ? [result.initialTemplates.management]
        : [];

      console.log(
        "HERE KITTY YOU CAN HAS CHEESEBURGER",
        marketingCards,
        productCards,
        managementCards
      );

      console.log("Starting document phase with result:", result);
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
        marketingCards: marketingCards,
        productCards: productCards,
        managementCards: managementCards,
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
    async (sections: BusinessPlanSection[], timer?: number) => {
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
            previousAttempts: submittedBusinessPlans || [],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to validate business plan");
        }

        const result = await response.json();

        console.log("Validation result:", result);

        if (result.type === "accepted") {
          startDocumentPhase(result.response);
        } else {
          setSubmittedBusinessPlans((prev) => [...prev, sections]);
          if (submittedBusinessPlans.length >= 2 && timer! <= 20) {
            console.log("Max attempts reached, showing final feedback.");
            setState((prevState) => ({
              ...prevState,
              currentPhase: "evaluation",
            }));
          } else {
            setState((prevState) => ({
              ...prevState,
              sectionFeedback: result.response.sectionFeedback || [],
            }));
          }
        }
      } catch (error) {
        console.error("Error validating solution:", error);
        setState((prevState) => ({
          ...prevState,
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

  return {
    state,
    submittedBusinessPlans,
    startProblemPhase,
    startEvaluationPhase,
    evaluateSolution,
    testEvaluate,
    addDocument,
    updateDocument,
    updateCompanyValue,
  };
};

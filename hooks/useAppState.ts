import { useCallback, useState } from "react";
import { AppState, Document, Problem } from "@/types";
import problemsData from "@/data/problems.json";

const INITIAL_STATE: AppState = {
  currentPhase: "rules",
  currentProblem: null,
  documents: [],
  userSolution: "",
  timer: 0,
  isPassed: null,
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

  const evaluateSolution = useCallback(() => {
    // Skip evaluation for now and go straight to document phase
    startDocumentPhase();
  }, []);

  const startDocumentPhase = useCallback(() => {
    // Create initial documents based on user solution
    const businessPlan: Document = {
      id: "doc-bp-001",
      type: "business-plan",
      title: "Business Plan",
      content: `Business Plan\n\nExecutive Summary:\nOur company aims to revolutionize the action camera market by targeting casual users and families. We'll offer an intuitive, affordable camera with smart features that make capturing everyday moments effortless.\n\nProduct Strategy:\n- Easy-to-use interface with automatic mode selection\n- Competitive pricing at $149\n- Cloud integration for instant sharing\n- Family-friendly features like child-safe mode\n\nTarget Market:\n- Families with children\n- Travel enthusiasts\n- Pet owners\n- Social media content creators\n\nRevenue Model:\n- Hardware sales\n- Premium cloud storage subscriptions\n- Optional accessories\n\nGrowth Strategy:\n- Direct-to-consumer sales\n- Partnership with family-oriented retailers\n- Social media influencer marketing\n- Customer referral program`,
      editable: true,
      createdAt: new Date(),
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
      content: `# Market Research Summary\n\nMarket Size:\n- Global action camera market: $2.3B (2024)\n- Expected growth: 8.9% CAGR\n- Untapped casual user segment: 65% of potential market\n\nUser Preferences:\n- 78% want easier operation\n- 82% consider current prices too high\n- 91% interested in automatic cloud backup\n\nCompetitor Analysis:\n- GoPro: 42% market share, focus on professionals\n- DJI: 15% market share, drone integration\n- Others: 43% combined, varied focus\n\nPrice Sensitivity:\n- Sweet spot: $100-200\n- Willing to pay more for cloud features\n- Subscription model acceptance growing`,
      editable: true,
      createdAt: new Date(),
    };

    setState({
      ...state,
      currentPhase: "document",
      documents: [businessPlan, timeline, marketResearch],
      timer: 1800, // 30 minutes in seconds
    });
  }, [state]);

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

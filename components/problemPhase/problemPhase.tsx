"use client";

import { useEffect, useRef, useState } from "react";
import { BusinessPlanSection, Problem, SectionFeedback } from "@/types";
import {
  OptimizedTimer,
  OptimizedTimerRef,
} from "@/components/ui/optimizedTimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, Users, TrendingUp, DollarSign } from "lucide-react";

interface ProblemPhaseProps {
  problem: Problem;
  onEvaluate: (sections: BusinessPlanSection[], timer?: number) => void;
  testEvaluate?: () => void;
  sectionFeedback?: SectionFeedback[];
}

const BUSINESS_PLAN_SECTIONS: Omit<BusinessPlanSection, "value">[] = [
  {
    id: "problem-solution",
    title: "Your solution",
    placeholder:
      "How will it solve this problem? What makes your approach unique?",
    maxLength: 300,
  },
  {
    id: "target-audience",
    title: "Target Audience & Marketing",
    placeholder: "Who is your target audience? How will you market to them?",
    maxLength: 300,
  },
  {
    id: "financials",
    title: "Financials & Revenue Model",
    placeholder:
      "What is your revenue model? How will you sustain this business?",
    maxLength: 300,
  },
];

export function ProblemPhase({
  problem,
  onEvaluate,
  testEvaluate,
  sectionFeedback = [],
}: ProblemPhaseProps) {
  const [sections, setSections] = useState<BusinessPlanSection[]>(
    BUSINESS_PLAN_SECTIONS.map((section) => ({ ...section, value: "" }))
  );

  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const timerRef = useRef<OptimizedTimerRef>(null);

  const DEMO_DATA = {
    "problem-solution":
      "Build a simple website platform that lets local restaurants take orders directly without paying huge fees to delivery apps. Restaurants get their own ordering page and can manage everything through a basic dashboard. There, customers can find local restaurants nearby and order directly from them.",
    "target-audience":
      "Small family restaurants that are struggling with delivery app fees but need online ordering. I'll reach out to restaurant owners directly and partner with local food bloggers, and post in neighborhood Facebook groups where restaurant owners hang out. Focus on places that aren't big chains.",
    financials:
      "Charge restaurants a low monthly fee instead of taking a percentage of every order like the big apps do. This way restaurants keep more of their money. Start with just a few local restaurants and grow from there. Maybe add payment processing for a small fee to make money that way too.",
  };

  useEffect(() => {
    setWaiting(false);
    console.log("ASDASD", sectionFeedback);
    if (sectionFeedback.length > 0) {
      if (timerRef.current && getTime() < 20) {
        console.log("Adjusting timer based on feedback");
        adjustTimer(60);
      }
    }
  }, [sectionFeedback]);

  const adjustTimer = (seconds: number) => {
    timerRef.current?.adjustTime(seconds);
  };

  const getTime = () => {
    return timerRef.current?.getTime() || 0;
  };

  const updateSection = (id: string, value: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id
          ? { ...section, value: value.slice(0, section.maxLength) }
          : section
      )
    );
  };

  const getSectionFeedback = (section: BusinessPlanSection) => {
    return sectionFeedback.find(
      (feedback) =>
        feedback.sectionId === section.id ||
        feedback.sectionId === section.title
    );
  };

  const isFormValid = () => {
    return sections.every((section) => section.value.trim().length > 0);
  };

  const handleSubmit = () => {
    setWaiting(true);
    onEvaluate(sections, timerRef.current?.getTime());
    setOpenTooltip(null);
  };

  const fillDemoData = () => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        value: DEMO_DATA[section.id as keyof typeof DEMO_DATA] || "",
      }))
    );
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case "problem-solution":
        return <TrendingUp className="w-4 h-4" />;
      case "target-audience":
        return <Users className="w-4 h-4" />;
      case "financials":
        return <DollarSign className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex flex-col h-full animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Business Plan Development</h1>
            <p className="text-gray-600 text-sm mt-1">
              Analyze the problem and create your technical solution
            </p>
          </div>
          <div className="flex items-center gap-4">
            {process.env.NODE_ENV === "development" && (
              <Button
                variant="outline"
                size="sm"
                onClick={testEvaluate}
                className="text-sm bg-red-300"
              >
                Dev Skip
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={fillDemoData}
              className="text-sm bg-red-300"
            >
              Demo Input
            </Button>
            <OptimizedTimer
              ref={timerRef}
              initialTime={6 * 60}
              onComplete={handleSubmit}
              className="min-w-28"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 flex-grow overflow-hidden">
          {/* Problem Analysis - Takes up 3 columns */}
          <div className="lg:col-span-3 space-y-4 overflow-y-auto">
            {/* Problem Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {problem.sections.problemOverview.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {problem.sections.problemOverview.desc}
                </p>
              </CardContent>
            </Card>

            {/* Key Pain Points */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Key Pain Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {problem.sections.keyPainPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900">
                          {point.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {point.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Plan Form - 2 columns */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-grow overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Solution</CardTitle>
                <p className="text-sm text-gray-600">
                  Build a technical solution to this problem
                </p>
              </CardHeader>
              <CardContent className="overflow-y-auto space-y-4">
                {sections.map((section) => {
                  const feedback = getSectionFeedback(section);
                  const hasError = feedback && !feedback.isValid;
                  const hasSuccess = feedback && feedback.isValid;

                  return (
                    <div key={section.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getSectionIcon(section.id)}
                          <label className="font-medium text-sm">
                            {section.title}
                          </label>

                          {hasError && (
                            <Tooltip
                              open={openTooltip === section.id}
                              onOpenChange={(open) => {
                                setOpenTooltip(open ? section.id : null);
                              }}
                            >
                              <TooltipTrigger asChild>
                                <button
                                  className="flex items-center"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setOpenTooltip((prev) =>
                                      prev === section.id ? null : section.id
                                    );
                                  }}
                                >
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-sm bg-red-50 border-red-200"
                                onPointerDownOutside={() => {
                                  setOpenTooltip(null);
                                }}
                              >
                                <p className="text-red-700 text-xs">
                                  {feedback.feedback}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>

                        <span className="text-xs text-gray-500">
                          {section.value.length} / {section.maxLength}
                        </span>
                      </div>

                      <textarea
                        value={section.value}
                        onChange={(e) =>
                          updateSection(section.id, e.target.value)
                        }
                        disabled={waiting}
                        placeholder={section.placeholder}
                        className={`w-full p-3 border rounded-md resize-none text-sm transition-colors ${
                          hasError
                            ? "border-red-300 bg-red-50 focus:border-red-400"
                            : hasSuccess
                            ? "border-green-300 bg-green-50 focus:border-green-400"
                            : "border-gray-300 focus:border-blue-400"
                        }`}
                        rows={4}
                      />
                    </div>
                  );
                })}
                <div className="mt-4 flex flex-col gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || waiting}
                    className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                    size="lg"
                  >
                    {waiting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C6.477 0 2 4.477 2 10h2zm2 5.291A7.962 7.962 0 014 12H2c0 3.042 1.135 5.824 3 7.938l1-1.647z"
                          ></path>
                        </svg>
                        Evaluating Solution...
                      </>
                    ) : (
                      "Submit Technical Plan"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

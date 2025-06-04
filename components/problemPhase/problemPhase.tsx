"use client";

import { useEffect, useState } from "react";
import { BusinessPlanSection, Problem, SectionFeedback } from "@/types";
import { OptimizedTimer } from "@/components/ui/optimizedTimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, Users, TrendingUp, Calendar } from "lucide-react";

interface ProblemPhaseProps {
  problem: Problem;
  timer: number;
  onEvaluate: (
    sections: BusinessPlanSection[],
    previousAttempts?: BusinessPlanSection[][]
  ) => void;
  testEvaluate?: () => void;
  onTimerChange: (time: number) => void;
  sectionFeedback?: SectionFeedback[];
  isLoading: boolean;
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
    maxLength: 250,
  },
  {
    id: "implementation",
    title: "Implementation",
    placeholder:
      "How do you plan to implement this? What are the key steps and your goal?",
    maxLength: 250,
  },
];

export function ProblemPhase({
  problem,
  timer,
  onEvaluate,
  testEvaluate,
  onTimerChange,
  sectionFeedback = [],
  isLoading: isValidating,
}: ProblemPhaseProps) {
  const [sections, setSections] = useState<BusinessPlanSection[]>(
    BUSINESS_PLAN_SECTIONS.map((section) => ({ ...section, value: "" }))
  );
  const [previousAttempts, setPreviousAttempts] = useState<
    BusinessPlanSection[][]
  >([]);

  useEffect(() => {
    if (timer === 0 && !isValidating) {
      handleSubmit();
    }
  }, [timer, isValidating]);

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
    if (!isFormValid()) return;

    setPreviousAttempts((prev) => [...prev, sections]);
    onEvaluate(sections, previousAttempts);
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case "problem-solution":
        return <TrendingUp className="w-4 h-4" />;
      case "target-audience":
        return <Users className="w-4 h-4" />;
      case "implementation":
        return <Calendar className="w-4 h-4" />;
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
            <OptimizedTimer
              initialTime={timer}
              autoStart={true}
              onComplete={handleSubmit}
              onTimeChange={onTimerChange}
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

            {/* Target Segments */}
            {/* <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {problem.sections.targetSegment.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {problem.sections.targetSegment.segments.map(
                    (segment, index) => (
                      <div key={index}>
                        <p className="text-sm">
                          <span className="font-medium text-gray-900">
                            {segment.title}:
                          </span>{" "}
                          <span className="text-gray-700">{segment.desc}</span>
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card> */}
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
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-sm bg-red-50 border-red-200"
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
                        disabled={isValidating}
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
                    disabled={!isFormValid() || isValidating}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {isValidating
                      ? "Evaluating Solution..."
                      : "Submit Technical Plan"}
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

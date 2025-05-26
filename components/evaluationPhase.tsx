// components/evaluationPhase.tsx
"use client";

import { useState, useEffect } from "react";
import { Document } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Star,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EvaluationData {
  overallScore: number;
  categoryScores: {
    strategy: number;
    marketUnderstanding: number;
    productDevelopment: number;
    marketing: number;
    financialManagement: number;
    adaptability: number;
  };
  feedback: {
    strengths: string[];
    weaknesses: string[];
    keyInsights: string[];
    recommendations: string[];
  };
  summary: string;
}

interface EvaluationPhaseProps {
  businessPlan: Document | null;
  logs: Document[];
  companyValue: number;
  onRestart?: () => void;
}

export function EvaluationPhase({
  businessPlan,
  logs,
  companyValue,
  onRestart,
}: EvaluationPhaseProps) {
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !evaluation) {
      generateEvaluation();
    }
  }, []);

  const generateEvaluation = async () => {
    try {
      setIsLoading(true);
      const buildLogs = logs
        .map(
          (doc) =>
            `${doc.title}: ${
              typeof doc.content === "string"
                ? doc.content
                : doc.content?.toString() || ""
            }`
        )
        .join("\n\n");

      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessPlan:
            typeof businessPlan?.content === "string"
              ? businessPlan.content
              : "Business plan content not available",
          logs,
          companyValue: companyValue ?? 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate evaluation");

      const data = await response.json();
      if (!evaluation) {
        setEvaluation(data);
      }
    } catch (error) {
      console.error(
        "Error generating evaluation. Using fallback option. ",
        error
      );
      // Fallback evaluation
      setEvaluation({
        overallScore: 75,
        categoryScores: {
          strategy: 8,
          marketUnderstanding: 7,
          productDevelopment: 8,
          marketing: 7,
          financialManagement: 6,
          adaptability: 9,
        },
        feedback: {
          strengths: [
            "Strong initial planning",
            "Good adaptation to market feedback",
          ],
          weaknesses: [
            "Could improve financial planning",
            "Limited market research",
          ],
          keyInsights: [
            "Market timing is crucial",
            "Customer feedback drives success",
          ],
          recommendations: [
            "Focus on customer acquisition",
            "Develop stronger financial projections",
          ],
        },
        summary:
          "Good overall performance with room for improvement in financial planning.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", variant: "default" as const };
    if (score >= 80)
      return { label: "Very Good", variant: "secondary" as const };
    if (score >= 70) return { label: "Good", variant: "secondary" as const };
    if (score >= 60) return { label: "Fair", variant: "outline" as const };
    return { label: "Needs Improvement", variant: "destructive" as const };
  };

  const categoryIcons = {
    strategy: Target,
    marketUnderstanding: TrendingUp,
    productDevelopment: Lightbulb,
    marketing: Users,
    financialManagement: DollarSign,
    adaptability: RotateCcw,
  };

  const categoryLabels = {
    strategy: "Strategy & Planning",
    marketUnderstanding: "Market Understanding",
    productDevelopment: "Product Development",
    marketing: "Marketing & Sales",
    financialManagement: "Financial Management",
    adaptability: "Adaptability & Learning",
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold mb-4">
            Evaluating Your Performance...
          </h1>
          <p className="text-gray-600">
            Analyzing your business decisions and outcomes
          </p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Evaluation Error</h1>
          <p className="text-gray-600 mb-4">Unable to generate evaluation</p>
          <Button onClick={generateEvaluation}>Try Again</Button>
        </div>
      </div>
    );
  }

  const badge = getScoreBadge(evaluation.overallScore);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center mb-8">
        <Trophy className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">
          Business Simulation Complete!
        </h1>
        <p className="text-gray-600">Here's how you performed</p>
      </div>

      {/* Overall Score Card */}
      <Card className="mb-8 border-2">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Overall Performance</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div
            className={cn(
              "text-6xl font-bold mb-2",
              getScoreColor(evaluation.overallScore)
            )}
          >
            {evaluation.overallScore}
          </div>
          <Badge variant={badge.variant} className="text-lg px-4 py-1 mb-4">
            {badge.label}
          </Badge>
          <div className="max-w-md mx-auto">
            <Progress value={evaluation.overallScore} className="h-3 mb-2" />
            <p className="text-sm text-gray-600">
              Final Company Value: ${companyValue.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(evaluation.categoryScores).map(([key, score]) => {
          const Icon = categoryIcons[key as keyof typeof categoryIcons];
          return (
            <Card key={key}>
              <CardContent className="p-4 text-center">
                <Icon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-medium text-sm mb-2">
                  {categoryLabels[key as keyof typeof categoryLabels]}
                </h3>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    getScoreColor(score * 10)
                  )}
                >
                  {score}/10
                </div>
                <Progress value={score * 10} className="h-2 mt-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feedback Sections */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation.feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation.feedback.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Summary and Insights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6">{evaluation.summary}</p>

          {evaluation.feedback.keyInsights.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-blue-700">Key Insights</h4>
              <ul className="space-y-1">
                {evaluation.feedback.keyInsights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.feedback.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-purple-700">
                Recommendations
              </h4>
              <ul className="space-y-1">
                {evaluation.feedback.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="text-center">
        {onRestart && (
          <Button
            onClick={onRestart}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Another Simulation
          </Button>
        )}
      </div>
    </div>
  );
}

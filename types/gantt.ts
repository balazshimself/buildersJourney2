export interface GanttChartProps {
  tasks: GanttTask[];
  className?: string;
  onTaskClick?: (task: GanttTask) => void;
  onDateChange?: (task: GanttTask, start: Date, end: Date) => void;
  onProgressChange?: (task: GanttTask, progress: number) => void;
}

export interface GanttChartData {
  tasks: GanttTask[];
  summary: string;
  generatedAt: Date;
}

export type GanttTask = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: string;
  customClass?: string;
};

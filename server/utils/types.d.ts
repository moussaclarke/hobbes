declare interface Task {
  id: string;
  url: string;
  etag: string;
  summary: string;
  description: string;
  status?: TaskStatus;
  organizer?: string;
  priority?: number;
  categories?: string[];
  created: Date;
  lastModified: Date;
  percentComplete: number;
  completed?: Date;
  rawData: string;
}

declare type TaskStatus =
  | "NEEDS-ACTION"
  | "IN-PROCESS"
  | "COMPLETED"
  | "CANCELLED";

declare type TaskPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH";

declare type EmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

declare type EmailProvider = (options: EmailOptions) => Promise<void>;

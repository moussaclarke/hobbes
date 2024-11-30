declare interface Task {
  id: string;
  url: string;
  etag: string;
  summary: string;
  description: string;
  status?: TaskStatus;
  categories?: string[];
  created: Date;
  lastModified: Date;
  percentComplete: number;
}

declare type TaskStatus = "NEEDS-ACTION"| "IN-PROCESS" | "COMPLETED" | "CANCELLED";

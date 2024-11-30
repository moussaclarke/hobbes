declare interface Todo {
  id: string;
  url: string;
  etag: string;
  summary: string;
  description: string;
  status: string;
  categories: string[];
  created: Date;
  lastModified: Date;
  percentComplete: number;
}

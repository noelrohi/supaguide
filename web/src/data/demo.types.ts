export type Demo = {
  id: string;
  isDraft: boolean | null;
  title: string | null;
  clickCount: number | null;
  createdAt: string;
  updatedAt: string | null;
  clicks: Array<{
    id: string;
    demoId: string;
    x: number;
    y: number;
    elementHTML: string | null;
    elementContent: string | null;
    imageUrl: string;
    createdAt: string;
    updatedAt: string | null;
  }>;
};

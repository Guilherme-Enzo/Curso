export type CourseModule = {
  id: string;
  order: number;
  name: string;
  description: string | null;
  synopsis: string | null;
  pdfUrl: string | null;
  isFree: boolean;
  createdAt: string;
};

export type Question = {
  id: string;
  questionText: string;
  answerText: string | null;
  answeredAt?: string | null;
  status: "open" | "answered";
  createdAt: string;
  user: { id: string; name: string };
  answeredBy?: { id: string; name: string; role: string } | null;
};

export type TeacherUser = {
  id: string;
  name: string;
  email: string;
  coCreatedAt: string;
  role: string;
};

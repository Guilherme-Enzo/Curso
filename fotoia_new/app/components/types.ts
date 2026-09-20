export type CourseModule = {
  id: string;
  order: number;
  name: string;
  description: string | null;
  synopsis: string | null;
  pdfUrl: string | null;
  createdAt: string;
};

export type Question = {
  id: string;
  questionText: string;
  answerText: string | null;
  status: "open" | "answered";
  createdAt: string;
  user: { id: string; name: string };
};

export type TeacherUser = {
  id: string;
  name: string;
  email: string;
  coCreatedAt: string;
  role: string;
};

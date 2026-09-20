-- Remove the quiz and performance subsystem, including stored attempts and study time.
DROP TABLE IF EXISTS "QuizAttempt";
DROP TABLE IF EXISTS "QuizOption";
DROP TABLE IF EXISTS "QuizQuestion";
DROP TABLE IF EXISTS "Quiz";
DROP TABLE IF EXISTS "StudyTime";

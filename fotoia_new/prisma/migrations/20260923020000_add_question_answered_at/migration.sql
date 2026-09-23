ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "answeredAt" TIMESTAMP(3);
UPDATE "Question" SET "answeredAt" = "createdAt" WHERE "status" = 'answered' AND "answeredAt" IS NULL;

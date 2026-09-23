ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "answeredById" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Question_answeredById_fkey'
  ) THEN
    ALTER TABLE "Question"
    ADD CONSTRAINT "Question_answeredById_fkey"
    FOREIGN KEY ("answeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Question_answeredById_idx" ON "Question"("answeredById");

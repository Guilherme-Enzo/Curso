CREATE TABLE "PromptView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptView_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModuleView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleView_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromptView_userId_promptId_key" ON "PromptView"("userId", "promptId");
CREATE INDEX "PromptView_userId_viewedAt_idx" ON "PromptView"("userId", "viewedAt");
CREATE UNIQUE INDEX "ModuleView_userId_moduleId_key" ON "ModuleView"("userId", "moduleId");
CREATE INDEX "ModuleView_userId_viewedAt_idx" ON "ModuleView"("userId", "viewedAt");

ALTER TABLE "PromptView" ADD CONSTRAINT "PromptView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PromptView" ADD CONSTRAINT "PromptView_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModuleView" ADD CONSTRAINT "ModuleView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModuleView" ADD CONSTRAINT "ModuleView_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

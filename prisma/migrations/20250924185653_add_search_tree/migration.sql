-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "searchTreeId" INTEGER;

-- CreateTable
CREATE TABLE "public"."SearchTree" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchTree_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchTree_slug_key" ON "public"."SearchTree"("slug");

-- CreateIndex
CREATE INDEX "SearchTree_parentId_idx" ON "public"."SearchTree"("parentId");

-- CreateIndex
CREATE INDEX "SearchTree_slug_idx" ON "public"."SearchTree"("slug");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_searchTreeId_fkey" FOREIGN KEY ("searchTreeId") REFERENCES "public"."SearchTree"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SearchTree" ADD CONSTRAINT "SearchTree_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."SearchTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

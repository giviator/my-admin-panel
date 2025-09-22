-- CreateTable
CREATE TABLE "public"."Homepage" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Homepage_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "extractedAt" TIMESTAMP(3),
ADD COLUMN     "extractionMethod" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

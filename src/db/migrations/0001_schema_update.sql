-- Update methods table to add archived field
ALTER TABLE "methods" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;

-- Update success_logs table to remove mindset_id
ALTER TABLE "success_logs" DROP CONSTRAINT "success_logs_mindset_id_mindsets_id_fk";
ALTER TABLE "success_logs" DROP COLUMN "mindset_id";
ALTER TABLE "success_logs" ALTER COLUMN "method_id" SET NOT NULL;

-- Remove archived field from mindsets
ALTER TABLE "mindsets" DROP COLUMN "archived";

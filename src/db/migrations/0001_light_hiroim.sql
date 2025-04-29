ALTER TABLE "success_logs" DROP CONSTRAINT "success_logs_mindset_id_mindsets_id_fk";
--> statement-breakpoint
ALTER TABLE "success_logs" ALTER COLUMN "method_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "methods" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "mindsets" DROP COLUMN "archived";--> statement-breakpoint
ALTER TABLE "success_logs" DROP COLUMN "mindset_id";
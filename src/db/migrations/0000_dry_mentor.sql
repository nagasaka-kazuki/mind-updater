CREATE TABLE "methods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"mindset_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mindsets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "success_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"mindset_id" uuid NOT NULL,
	"method_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"memo" text
);
--> statement-breakpoint
ALTER TABLE "methods" ADD CONSTRAINT "methods_mindset_id_mindsets_id_fk" FOREIGN KEY ("mindset_id") REFERENCES "public"."mindsets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "success_logs" ADD CONSTRAINT "success_logs_mindset_id_mindsets_id_fk" FOREIGN KEY ("mindset_id") REFERENCES "public"."mindsets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "success_logs" ADD CONSTRAINT "success_logs_method_id_methods_id_fk" FOREIGN KEY ("method_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
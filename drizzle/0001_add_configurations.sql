DROP TABLE "favorites";--> statement-breakpoint
DROP TABLE "templates";--> statement-breakpoint
CREATE TABLE "configurations" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'outro' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"cover_image_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"form_snapshot" jsonb NOT NULL,
	"prompt" text DEFAULT '' NOT NULL,
	"negative_prompt" text DEFAULT '' NOT NULL,
	"provider_id" text,
	"provider_name" text,
	"model_id" text,
	"model_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

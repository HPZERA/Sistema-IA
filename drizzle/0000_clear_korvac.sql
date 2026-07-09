CREATE TABLE "ai_providers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"api_key" text DEFAULT '' NOT NULL,
	"endpoint" text,
	"models" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_images" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" text NOT NULL,
	"blob_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"reference_type" text DEFAULT 'outro' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"gender" text DEFAULT '' NOT NULL,
	"age" integer NOT NULL,
	"height" text DEFAULT '' NOT NULL,
	"skin_color" text DEFAULT '' NOT NULL,
	"eye_color" text DEFAULT '' NOT NULL,
	"face_shape" text DEFAULT '' NOT NULL,
	"hair_color" text DEFAULT '' NOT NULL,
	"hair_length" text DEFAULT '' NOT NULL,
	"hair_type" text DEFAULT '' NOT NULL,
	"body_type" text DEFAULT '' NOT NULL,
	"weight" text DEFAULT '' NOT NULL,
	"tattoos" text DEFAULT '' NOT NULL,
	"piercings" text DEFAULT '' NOT NULL,
	"style" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"consistency_level" text DEFAULT 'media' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generations" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt" text NOT NULL,
	"negative_prompt" text DEFAULT '' NOT NULL,
	"provider_id" text,
	"provider_name" text NOT NULL,
	"model_id" text NOT NULL,
	"model_label" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"duration_ms" integer,
	"credits_used" numeric,
	"cost_usd" numeric,
	"image_url" text,
	"form_snapshot" jsonb,
	"status" text NOT NULL,
	"error_message" text,
	"cache_key" text,
	"served_from_cache" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_modules" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"library_key" text NOT NULL,
	"name" text NOT NULL,
	"icon" text DEFAULT '' NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"complementary_prompt" text DEFAULT '' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_options" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" text NOT NULL,
	"label" text NOT NULL,
	"keywords" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"form_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "character_images" ADD CONSTRAINT "character_images_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_options" ADD CONSTRAINT "library_options_module_id_library_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."library_modules"("id") ON DELETE cascade ON UPDATE no action;
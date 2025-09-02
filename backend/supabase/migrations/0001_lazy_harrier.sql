CREATE TABLE "ai_output" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"parsed_output" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pdf_events" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"all_day" boolean DEFAULT true,
	"last_modified" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schedule_events" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"aiOutputId" uuid,
	"user_id" uuid NOT NULL,
	"course_name" text NOT NULL,
	"course_code" text NOT NULL,
	"location" text,
	"start_recur" date NOT NULL,
	"end_recur" date,
	"start_time" time NOT NULL,
	"end_time" time,
	"day_of_the_week" integer[]
);
--> statement-breakpoint
--> ALTER TABLE "events" DROP CONSTRAINT "events_calendar_source_id_unique";--> statement-breakpoint
--> ALTER TABLE "user_calendars" DROP CONSTRAINT "user_calendars_user_id_unique";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "calendar_source_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "external_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_output" ADD CONSTRAINT "ai_output_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pdf_events" ADD CONSTRAINT "pdf_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_aiOutputId_ai_output_id_fk" FOREIGN KEY ("aiOutputId") REFERENCES "public"."ai_output"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "recurrence_rule";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "categories";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "attendees";
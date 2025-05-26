CREATE TABLE "calendar_sources" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"sync_frequency" text DEFAULT 'daily' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"last_synced" timestamp with time zone,
	"next_sync" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "sync_freq_check" CHECK ("calendar_sources"."sync_frequency" IN ('hourly', 'daily', 'weekly', 'manual'))
);
--> statement-breakpoint
CREATE TABLE "calendar_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"calendar_source_id" uuid NOT NULL,
	"sync_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sync_completed_at" timestamp with time zone,
	"status" text NOT NULL,
	"events_added" text DEFAULT '0',
	"events_updated" text DEFAULT '0',
	"events_removed" text DEFAULT '0',
	"error_message" text,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"calendar_source_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"all_day" boolean DEFAULT false,
	"recurrence_rule" jsonb,
	"last_modified" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"status" text DEFAULT 'confirmed',
	"categories" text[],
	"url" text,
	"attendees" jsonb,
	CONSTRAINT "events_calendar_source_id_unique" UNIQUE("calendar_source_id"),
	CONSTRAINT "events_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "user_calendars" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"calendar_source_id" uuid NOT NULL,
	"is_visible" boolean DEFAULT true,
	"color" text DEFAULT '#4F46E5',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_calendars_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_calendars_calendar_source_id_unique" UNIQUE("calendar_source_id")
);
--> statement-breakpoint

--> statement-breakpoint
ALTER TABLE "calendar_sources" ADD CONSTRAINT "calendar_sources_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_sync_logs" ADD CONSTRAINT "calendar_sync_logs_calendar_source_id_calendar_sources_id_fk" FOREIGN KEY ("calendar_source_id") REFERENCES "public"."calendar_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_calendar_source_id_calendar_sources_id_fk" FOREIGN KEY ("calendar_source_id") REFERENCES "public"."calendar_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_calendars" ADD CONSTRAINT "user_calendars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_calendars" ADD CONSTRAINT "user_calendars_calendar_source_id_calendar_sources_id_fk" FOREIGN KEY ("calendar_source_id") REFERENCES "public"."calendar_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "event_unique_idx" ON "events" USING btree ("calendar_source_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_calendar_unique_idx" ON "user_calendars" USING btree ("user_id","calendar_source_id");

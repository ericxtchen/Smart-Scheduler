import { pgSchema, pgTable, text, uuid, boolean, timestamp, check, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";


export const users = pgTable("users", {
  id: uuid('id').primaryKey()
})

export const calendarSources = pgTable('calendar_sources', { //maybe remove option to upload ics file entirely and just use ics links
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  name: text('name').notNull(),
  url: text('url'),
  syncFrequency: text('sync_frequency').notNull().default('daily'), // there is a check if sync_frequency in 'hourly', 'daily', 'weekly', or 'manual'
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  lastSynced: timestamp('last_synced', { withTimezone: true }),
  nextSync: timestamp('next_sync', { withTimezone: true }),
  IsActive: boolean('is_active').default(true)
}, (table) => [
  check("sync_freq_check", sql`${table.syncFrequency} IN ('hourly', 'daily', 'weekly', 'manual')`)
]);

export const userCalendars = pgTable('user_calendars', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  calendarSourceId: uuid('calendar_source_id').notNull().references(() => calendarSources.id, { onDelete: 'cascade' }).unique(),
  isVisible: boolean('is_visible').default(true),
  color: text('color').default('#4F46E5'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
  uniqueIndex("user_calendar_unique_idx").on(table.userId, table.calendarSourceId)
]);

export const events = pgTable('events', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  // got rid of .unique() for calendarSourceId because multiple events can come form the same calendar source ...
  calendarSourceId: uuid('calendar_source_id').notNull().references(() => calendarSources.id, { onDelete: 'cascade' }),
  externalId: text('external_id').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  allDay: boolean('all_day').default(false),
  //recurrenceRule: jsonb('recurrence_rule'),
  lastModified: timestamp('last_modified', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  //status: text('status').default('confirmed'),
  //categories: text('categories').array(),
  //url: text('url'),
  //attendees: jsonb('attendees')
}, (table) => [
  uniqueIndex('event_unique_idx').on(table.calendarSourceId, table.externalId)
]);

export const calendarSyncLogs = pgTable('calendar_sync_logs', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  calendarSourceId: uuid('calendar_source_id').notNull().references(() => calendarSources.id, { onDelete: 'cascade' }),
  syncStartedAt: timestamp('sync_started_at', { withTimezone: true }).notNull().defaultNow(),
  syncCompletedAt: timestamp('sync_completed_at', { withTimezone: true }),
  status: text('status').notNull(),
  eventsAdded: text('events_added').default('0'),
  eventsUpdated: text('events_updated').default('0'),
  eventsRemoved: text('events_removed').default('0'),
  errorMessage: text('error_message'),
  details: jsonb('details')
});

// Define relations between tables
export const calendarSourcesRelations = relations(calendarSources, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [calendarSources.createdBy],
    references: [users.id],
  }),
  userCalendars: many(userCalendars),
  events: many(events),
  syncLogs: many(calendarSyncLogs),
}));

export const userCalendarsRelations = relations(userCalendars, ({ one }) => ({
  user: one(users, {
    fields: [userCalendars.userId],
    references: [users.id],
  }),
  calendarSource: one(calendarSources, {
    fields: [userCalendars.calendarSourceId],
    references: [calendarSources.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  calendarSource: one(calendarSources, {
    fields: [events.calendarSourceId],
    references: [calendarSources.id],
  }),
}));

export const calendarSyncLogsRelations = relations(calendarSyncLogs, ({ one }) => ({
  calendarSource: one(calendarSources, {
    fields: [calendarSyncLogs.calendarSourceId],
    references: [calendarSources.id],
  }),
}));

import { z } from "zod";

const ScheduleMeetingSchema = z.object({
  dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid start time format, expected HH:mm"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid end time format, expected HH:mm"),
  location: z.string(),
  building: z.string().optional(),
})

const CourseSchema = z.object({
  courseCode: z.string(),
  courseName: z.string(),
  section: z.string().optional(),
  instructor: z.string().optional(),
  type: z.enum(["lecture", "lab", "recitation", "seminar"]).optional(),
  schedule: z.array(ScheduleMeetingSchema),
  credits: z.number().optional(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
});

export const ParsedScheduleSchema = z.looseObject({
  confidence: z.enum(["high", "medium", "low"]),
  courses: z.array(CourseSchema),
  metadata: z.looseObject({
    totalCourses: z.number(),
    semester: z.string().optional(),
    imageQuality: z.enum(["high", "medium", "low"]).optional(),
    parsingNotes: z.string().optional(),
  })
});

export type ParsedSchedule = z.infer<typeof ParsedScheduleSchema>;


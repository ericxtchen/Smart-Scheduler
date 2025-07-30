export interface ScheduleMeeting {
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  startTime: string,
  endTime: string,
  location: string
}

export interface Course {
  courseCode: string,
  courseName: string,
  section?: string,
  instructor?: string,
  type?: "lecture" | "lab" | "recitation" | "seminar",
  schedule: ScheduleMeeting[],
  credits?: number,
  confidence?: "high" | "medium" | "low"
}

export interface ParsedSchedule {
  confidence: "high" | "medium" | "low"
  courses: Course[],
  metadata: {
    totalCourses: number,
    semester?: string,
    imageQuality?: "high" | "medium" | "low"
    parsingNotes?: string
  }
}

export interface FullParsingResult extends ParsedSchedule {
  processingStrategy: number,
  metadata: ParsedSchedule['metadata'] & {
    preprocessingIssues: string[],
    preprocessingRecomendations: string[]
  }
}

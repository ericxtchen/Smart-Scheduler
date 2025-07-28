// Prompt Engineering System
export class SchedulePromptEngine {
  /**
   * Generate the main parsing prompt with dynamic context
   */
  generateParsingPrompt(
    universityContext?: string,
    semesterInfo?: string,
    additionalInstructions?: string
  ): string {
    const basePrompt = this.getBasePrompt();
    const contextPrompt = this.buildContextPrompt(universityContext, semesterInfo);
    const outputFormat = this.getOutputFormatSpec();
    const examples = this.getExampleOutputs();

    return `${basePrompt}

${contextPrompt}

${additionalInstructions || ''}

${outputFormat}

${examples}

CRITICAL: Return ONLY valid JSON. No markdown formatting, no explanations, just the JSON object.`;
  }

  /**
   * Core parsing instructions
   */
  private getBasePrompt(): string {
    return `You are an expert at parsing university class schedule images. Extract all class information with high accuracy.

PARSING RULES:
1. Look for course codes (e.g., "CSE 214", "MAT 125", "BIO 201")
2. Extract exact class titles/names
3. Identify days of the week (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
4. Parse time ranges (e.g., "9:30 AM - 10:50 AM", "14:30-15:45")
5. Find locations (room numbers, building codes)
6. Extract instructor names when visible
7. Look for section numbers or class identifiers
8. Identify any special notes (Lab, Recitation, Lecture, etc.)

ACCURACY PRIORITIES:
- Course codes and times are CRITICAL - be extremely careful
- If text is unclear, mark confidence as "low"
- Don't guess - if unsure, leave field empty
- Pay attention to AM/PM indicators
- Watch for overlapping or stacked text`;
  }

  /**
   * Build contextual information
   */
  private buildContextPrompt(university?: string, semester?: string): string {
    let context = '';

    if (university) {
      context += `UNIVERSITY: ${university}\n`;
      context += this.getUniversitySpecificRules(university);
    }

    if (semester) {
      context += `SEMESTER: ${semester}\n`;
    }

    return context;
  }

  /**
   * University-specific parsing rules
   */
  private getUniversitySpecificRules(university: string): string {
    const rules: Record<string, string> = {
      'stony brook': `
STONY BROOK SPECIFIC:
- Course codes format: "XXX ###" (e.g., "CSE 214", "AMS 161")
- Buildings often abbreviated (e.g., "COMP", "MATH", "PHYS")
- Times usually in 12-hour format with AM/PM
- Look for section numbers like "01", "02", etc.
- Labs/Recitations may be listed separately from lectures`,

      'rutgers': `
RUTGERS SPECIFIC:
- Course codes: "###:###" format (e.g., "01:198:214")
- Campus codes may be present (NB, NK, CAM)
- Index numbers are important identifiers`,

      'nyu': `
NYU SPECIFIC:
- Course codes vary by school
- Building codes are often abbreviated
- Multiple campus locations possible`
    };

    return rules[university.toLowerCase()] || '';
  }

  /**
   * JSON output format specification
   */
  private getOutputFormatSpec(): string {
    return `OUTPUT FORMAT:
Return a JSON object with this exact structure:

{
  "confidence": "high" | "medium" | "low",
  "courses": [
    {
      "courseCode": "CSE 214",
      "courseName": "Data Structures",
      "section": "01",
      "instructor": "Prof. Smith",
      "type": "lecture" | "lab" | "recitation" | "seminar",
      "schedule": [
        {
          "dayOfWeek": "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
          "startTime": "09:30",
          "endTime": "10:50",
          "location": "COMP 126",
          "building": "Computer Science Building"
        }
      ],
      "credits": 3,
      "confidence": "high" | "medium" | "low"
    }
  ],
  "metadata": {
    "totalCourses": 5,
    "semester": "Fall 2024",
    "imageQuality": "high" | "medium" | "low",
    "parsingNotes": "Any issues or observations"
  }
}`;
  }

  /**
   * Example outputs for few-shot learning
   */
  private getExampleOutputs(): string {
    return `EXAMPLE 1:
{
  "confidence": "high",
  "courses": [
    {
      "courseCode": "CSE 214",
      "courseName": "Data Structures",
      "section": "01",
      "instructor": "Dr. Johnson",
      "type": "lecture",
      "schedule": [
        {
          "dayOfWeek": "tuesday",
          "startTime": "11:30",
          "endTime": "12:50",
          "location": "COMP 126",
          "building": "Computer Science"
        },
        {
          "dayOfWeek": "thursday",
          "startTime": "11:30",
          "endTime": "12:50",
          "location": "COMP 126",
          "building": "Computer Science"
        }
      ],
      "credits": 4,
      "confidence": "high"
    }
  ],
  "metadata": {
    "totalCourses": 1,
    "semester": "Spring 2024",
    "imageQuality": "high",
    "parsingNotes": "Clear schedule format"
  }
}

TIME PARSING EXAMPLES:
- "9:30 AM - 10:50 AM" → startTime: "09:30", endTime: "10:50"
- "2:30 PM - 3:45 PM" → startTime: "14:30", endTime: "15:45"
- "14:30-15:45" → startTime: "14:30", endTime: "15:45"

DAY PARSING EXAMPLES:
- "MWF" → ["monday", "wednesday", "friday"]
- "TR" or "TuTh" → ["tuesday", "thursday"]
- "M/W/F" → ["monday", "wednesday", "friday"]`;
  }

  /**
   * Generate follow-up prompt for validation/correction
   */
  generateValidationPrompt(parsedData: any, userFeedback: string): string {
    return `Review and correct this parsed schedule data based on user feedback:

ORIGINAL PARSED DATA:
${JSON.stringify(parsedData, null, 2)}

USER FEEDBACK:
${userFeedback}

Please provide the corrected JSON with the same structure. Fix any errors mentioned in the feedback while preserving correctly parsed information.

Return ONLY the corrected JSON object.`;
  }

  /**
   * Generate basic parsing prompt for fallback scenarios
   */
  generateBasicParsingPrompt(): string {
    return `Extract class schedule information from this image.

Return JSON with this structure:
{
  "courses": [
    {
      "courseCode": "CSE 214",
      "courseName": "Data Structures",
      "schedule": [
        {
          "dayOfWeek": "monday",
          "startTime": "09:30",
          "endTime": "10:50",
          "location": "COMP 126"
        }
      ]
    }
  ]
}

Focus on accuracy. If uncertain, leave fields empty. Return only JSON.`;
  }

  /**
   * Generate minimal prompt for final fallback
   */
  generateMinimalPrompt(): string {
    return `Extract course codes, times, and days from this schedule image. Return as JSON array.`;
  }

  /**
   * Generate confidence assessment prompt (can be used as additional instruction if desired)
   */
  generateConfidencePrompt(): string {
    return `After parsing, also assess your confidence in each extracted field:

CONFIDENCE LEVELS:
- "high": Text is clear, standard format, high certainty
- "medium": Some ambiguity but reasonable interpretation
- "low": Text unclear, guessing required, or unusual format

Mark individual fields and overall parsing confidence accordingly.`;
  }
}

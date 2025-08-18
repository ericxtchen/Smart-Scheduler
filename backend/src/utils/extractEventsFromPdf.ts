import { parse as parseDate, getYear, isAfter, addYears } from 'date-fns';

export interface SyllabusEvent {
    event: string,
    dateString: string,
    parsedDate: Date,
    context: string
}

const inferAcademicYear = (date: Date): Date => {
    const today = new Date();
    const currentYear = getYear(today);
    
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(today.getMonth() - 4);

    if (isAfter(fourMonthsAgo, date)) {
        return addYears(date, 1);
    }

    return date;
};

export const extractEvents = (text: string): SyllabusEvent[] => {
    const events: SyllabusEvent[] = [];
    
    const keywords = ['midterm', 'final exam', 'exam', 'test', 'quiz', 'paper', 'project', 'assignment due', 'homework', 'lab report', 'essay', 'presentation'];
    
    const dateRegex = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2})/gi;

    const lines = text.split('\n');

    for (const line of lines) {
        const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'i');
        const keywordMatch = line.match(keywordRegex);

        if (keywordMatch) {
            const dateMatch = line.match(dateRegex);

            if (dateMatch) {
                const term = keywordMatch[0];
                const dateString = dateMatch[0];
                
                try {
                    let parsedDate = parseDate(dateString, 'P', new Date());
                    if (isNaN(parsedDate.getTime())) {
                       parsedDate = parseDate(dateString, 'MMMM d', new Date());
                    }
                     if (isNaN(parsedDate.getTime())) {
                       parsedDate = parseDate(dateString, 'MMM d', new Date());
                    }
                    
                    if (!isNaN(parsedDate.getTime())) {
                        const finalDate = inferAcademicYear(parsedDate);
                        events.push({
                            event: term,
                            dateString: dateString,
                            parsedDate: finalDate,
                            context: line.trim()
                        });
                    }
                } catch(e) {
                    console.error(`Could not parse date: ${dateString}`, e);
                }
            }
        }
    }

    return events;
};
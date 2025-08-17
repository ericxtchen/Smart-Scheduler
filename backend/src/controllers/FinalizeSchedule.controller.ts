import { Request, Response } from 'express';
import { db } from '../db';
import { aiOutput, scheduleEvents } from '../db/schema';
import { desc } from 'drizzle-orm';
import { ParsedScheduleSchema } from '../schemas/schedule.schema';

//TODO:
//FIND A WAY TO GET THE startRecur AND endRecur 
//CHECK DATE TYPE VS STRING TYPE ESP FOR FULLCALENDAR PARSING

interface EventsToInsertInterface {
  aiOutputId: string,
  courseName: string,
  courseCode: string,
  location: string,
  startRecur: string,
  endRecur: string,
  startTime: string,
  endTime: string,
  dayOfTheWeek: number[]
}

const dayOfWeekMap: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
}

export const FinalizeSchedule = async (req: Request, res: Response) => {
  try {
    // INSERT INTO scheduleEvents TABLE
    const latestAiOutputId = await db
      .select({
        aiOutputId: aiOutput.id
      })
      .from(aiOutput)
      .orderBy(desc(aiOutput.createdAt))
      .limit(1);

    const validatedData = ParsedScheduleSchema.parse(req.body.data);
    const semesterStart = req.body.semesterStart;
    const semesterEnd = req.body.semesterEnd;
    const endDate = new Date(semesterEnd);
    endDate.setDate(endDate.getDate() + 1);
    const endRecurString = endDate.toISOString().split('T')[0];

    // CHECK IF COURSE IS IN ARRAY BY CHECKING COURSE CODE
    // LOOP THROUGH COURSES 
    // GRAB COURSE CODE
    // LOOP THROUGH "schedule"
    // CHECK IF OBJECT WITH SAME COURSE CODE EXISTS IN THE LIST
    // IF TRUE, GRAB THE OBJECT
    //    CHECK IF START TIME AND END TIME ARE THE SAME 
    //      IF TRUE JUST APPEND CORRECT NUMBER CORRESPONDING TO THE DAY OF THE WEEK
    //      IF FALSE THEN CREATE A NEW EVENT? THEN WE WILL HAVE TO CHANGE THE COURSE CODE: maybe add (1) and increment the number when we need to?
    //
    // IF FALSE GET DAY OF THE WEEK AND CREATE AND APPEND EVENT OBJECT TO LIST
    // 
    const eventsToInsert: EventsToInsertInterface[] = [];

    for (const course of validatedData.courses) {
      const course_code = course.courseCode;
      let occurrence = 0;
      for (const event of course.schedule) {
        const eventObj = eventsToInsert.find(obj => obj.courseCode === course_code)
        if (eventObj) {
          if (eventObj.startTime === event.startTime && eventObj.endTime === event.endTime) {
            eventObj.dayOfTheWeek.push(dayOfWeekMap[event.dayOfWeek]); // DOES THIS ACTUALLY PUSH THE UPDATED OBJECT??
          } else {
            eventsToInsert.push({
              aiOutputId: latestAiOutputId[0].aiOutputId,
              courseCode: eventObj.courseCode + ` (${occurrence + 1})`,
              courseName: eventObj.courseName,
              location: eventObj.location,
              startRecur: semesterStart,
              endRecur: endRecurString,
              startTime: event.startTime,
              endTime: event.endTime,
              dayOfTheWeek: [dayOfWeekMap[event.dayOfWeek]]
            });
            occurrence++;
          }
        } else {
          eventsToInsert.push({
            aiOutputId: latestAiOutputId[0].aiOutputId,
            courseCode: course.courseCode,
            courseName: course.courseName,
            location: event.location,
            startRecur: semesterStart,
            endRecur: endRecurString,
            startTime: event.startTime,
            endTime: event.endTime,
            dayOfTheWeek: [dayOfWeekMap[event.dayOfWeek]]
          });
        }
      }
    }
    // always do a bulk insert as the operation is cheaper than inserting events one by one, resulting in the N+1 antipattern
    if (eventsToInsert.length > 0) {
      await db.insert(scheduleEvents).values(eventsToInsert);
    }
  } catch (error) {
    console.error(error);
  }
  // insert to aiOutput in the parseImg controller? and then grab the correct aiOutputId by searching for the latest 

} 

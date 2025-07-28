import { InferenceClient } from '@huggingface/inference';

const parseSchedule = async (img: Buffer) => {
  const client = new InferenceClient(process.env.HF_TOKEN);
  const base64img = img.toString('base64');

  const prompt = `
    Analyze this class schedule image and extract all the class information. 
  
    You must return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
    {
      "events": [
        {
          "title": "Course Name or Code",
          "dayOfWeek": 1,
          "startTime": "09:00",
          "endTime": "10:30",
          "location": "Room/Building",
          "instructor": "Professor Name",
          "courseCode": "COURSE123"
        }
      ],
      "confidence": 0.85,
      "warnings": ["Any issues or uncertainties"]
    }
    
    Rules:
    - dayOfWeek: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    - Times must be in 24-hour format (HH:MM) like "09:00" or "14:30"
    - Extract all visible classes/events from the schedule
    - If uncertain about information, add to warnings array
    - Confidence must be between 0.0 and 1.0
    - Return empty events array if no schedule found
    - Do not include any text outside the JSON object
  `;

  try {
    //TODO:
    //WRITE CODE TO SEND REQUEST TO AI MODEL
    //
  } catch (error) {

  }
}


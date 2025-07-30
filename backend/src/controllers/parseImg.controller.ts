import { Request, Response } from 'express';
import { ScheduleParsingService } from '../utils/ScheduleParsingService';
import { db } from '../db';
import { aiOutput } from '../db/schema';

export const parseImg = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided.' });
  }

  const SchedulePrompter = new ScheduleParsingService();
  try {
    const result = await SchedulePrompter.parseScheduleImage(req.file!.buffer, {
      university: "stony brook",
      semester: "Fall 2025"
    });
    console.log(result);

    const base64Image = req.file!.buffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    const name = req.user!.id + '_' + (new Date()).toISOString();
    await db.insert(aiOutput)
      .values({
        userId: req.user!.id,
        name: name,
        imageUrl: imageUrl,
        parsedOutput: result
      })

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to parse the image.' });
  }
}

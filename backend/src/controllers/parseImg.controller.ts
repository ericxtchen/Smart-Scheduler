import { Request, Response } from 'express';
import { ScheduleParsingService } from '../utils/ScheduleParsingService';

export const parseImg = async (req: Request, res: Response) => {
  const SchedulePrompter = new ScheduleParsingService();
  const result = SchedulePrompter.parseScheduleImage(req.file!.buffer, {
    university: "stony brook"
  });
  console.log(result);
  res.status(200);

}

// Integration service combining preprocessing and prompting
import { ImagePreprocessor } from "./ImagePreprocessor";
import { SchedulePromptEngine } from "./SchedulePromptEngine";
import { ImageQualityAssessment } from "./ImagePreprocessor";
import { InferenceClient } from "@huggingface/inference";

export class ScheduleParsingService {
  private preprocessor = new ImagePreprocessor();
  private promptEngine = new SchedulePromptEngine();
  private hf: InferenceClient;

  constructor() {
    const hfAPIKey = process.env.HF_TOKEN;
    if (!hfAPIKey) {
      throw new Error("HF_TOKEN not found!");
    }

    this.hf = new InferenceClient(hfAPIKey);
  }

  async parseScheduleImage(
    imageBuffer: Buffer,
    context: {
      university?: string;
      semester?: string;
      //userId: string; // Placeholder for user context if needed
    }
  ): Promise<any> {
    const fallbackStrategies = [
      // Strategy 1: Full quality assessment + adaptive preprocessing (with traditional upscaling if needed)
      async () => {
        // Pass options to preprocessor to allow/disallow specific behaviors
        const { processedBuffer, qualityAssessment } = await this.preprocessor.preprocessScheduleImage(imageBuffer, {
          upscale: true, // Allow traditional upscaling
          enhanceContrast: true,
          normalizeColors: true
        });
        const prompt = this.promptEngine.generateParsingPrompt(context.university, context.semester);
        return { result: await this.callVisionAPI(processedBuffer, prompt), quality: qualityAssessment };
      },

      // Strategy 2: Standardized preprocessing (general good practices)
      async () => {
        const standardizedBuffer = await this.preprocessor.standardizeImage(imageBuffer);
        const basicPrompt = this.promptEngine.generateBasicParsingPrompt();
        // Create a basic quality assessment for this strategy
        const quality: ImageQualityAssessment = { quality: 'medium', issues: ['standard_preprocessing_applied'], recommendations: [], metrics: {} };
        return { result: await this.callVisionAPI(standardizedBuffer, basicPrompt), quality: quality };
      },

      // Strategy 3: Original image + minimal prompt (absolute last resort)
      async () => {
        const minimalPrompt = this.promptEngine.generateMinimalPrompt();
        // Create a basic quality assessment for this strategy
        const quality: ImageQualityAssessment = { quality: 'low', issues: ['no_preprocessing_attempted'], recommendations: [], metrics: {} };
        return { result: await this.callVisionAPI(imageBuffer, minimalPrompt), quality: quality };
      }
    ];

    for (const [index, strategy] of fallbackStrategies.entries()) {
      try {
        console.log(`Attempting parsing strategy ${index + 1}...`);
        const { result, quality } = await strategy(); // quality is ImageQualityAssessment type
        const validatedResult = this.validateParsedData(result);

        if (this.isValidParseResult(validatedResult)) {
          console.log(`Parsing succeeded with strategy ${index + 1}`);
          // Ensure imageQuality in metadata is correctly populated from qualityAssessment
          return {
            ...validatedResult,
            processingStrategy: index + 1,
            metadata: {
              ...validatedResult.metadata,
              imageQuality: quality.quality, // Use the 'quality' string (high/medium/low) from assessment
              // You might also want to include issues/recommendations here
              preprocessingIssues: quality.issues,
              preprocessingRecommendations: quality.recommendations
            }
          };
        }
      } catch (error) {
        console.error(`Strategy ${index + 1} failed:`, error instanceof Error ? error.message : String(error));
        // Log full error for debugging: console.error(error);
        continue;
      }
    }

    throw new Error('All parsing strategies failed');
  }

  /**
   * Check if parse result is valid and usable
   */
  private isValidParseResult(result: any): boolean {
    return (
      result &&
      result.courses &&
      Array.isArray(result.courses) &&
      result.courses.length > 0 &&
      result.courses.every((course: any) =>
        course.courseCode &&
        course.schedule &&
        Array.isArray(course.schedule) &&
        course.schedule.length > 0 &&
        course.schedule.every((s: any) => s.dayOfWeek && s.startTime && s.endTime) // Basic checks for schedule items
      )
    );
  }

  private async callVisionAPI(imageBuffer: Buffer, prompt: string): Promise<any> {
    // Convert buffer to base64 for API
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    try {
      const response = await this.hf.chatCompletion({
        model: "Qwen/Qwen2.5-VL-7B-Instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant specialized in parsing university class schedules."
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl } },
              {
                type: "text",
                text: `Please extract the class information from this schedule image and return it as a JSON object strictly following the provided OUTPUT FORMAT.
If any text is unclear, mark confidence as "low" and do not guess.
Pay close attention to all details.
${prompt}`
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
        response_format: {
          type: "json_object"
        }
      });

      const generatedOutput = response.choices[0].message.content;
      console.log("Raw JSON string generated by QWEN: ", generatedOutput);

      try {
        if (generatedOutput) {
          const parsedOutput = JSON.parse(generatedOutput);
          console.log("Parsed output: ", parsedOutput);
          return parsedOutput;
        } else {
          throw new Error("Nothing in message.content");
        }
      } catch (e) {
        console.error("Model output was not valid JSON: ", generatedOutput);
        console.error("Error: ", e);
        throw new Error("Failed to parse QWEN Output.")
      }
    } catch (error) {
      console.error("Error calling QWEN HuggingFace API: ", error);
      if (error instanceof Error) {
        throw new Error(`Error calling QWEN HuggingFace API: ${error.message}`);
      }
      throw new Error(`Error calling QWEN HuggingFace API: ${String(error)}`);
    }

  }

  private validateParsedData(data: any): any {
    // Basic validation, more comprehensive checks can be added here
    if (typeof data !== 'object' || data === null) {
      console.warn("Parsed data is not an object:", data);
      return {}; // Return empty or a structure indicating failure
    }
    if (!Array.isArray(data.courses)) {
      data.courses = []; // Ensure courses is an array
    }
    // You can add more detailed sanitization or default values here.
    return data;
  }
}

// Image Preprocessing Pipeline
import sharp from 'sharp';
// Removed 'canvas' and 'loadImage' as the preprocessLowQualityImage method using them will be removed.

// --- Configuration Constants ---
// Minimum dimensions for "acceptable" resolution for text images
const MIN_IMAGE_WIDTH_FOR_TEXT = 800;
const MIN_IMAGE_HEIGHT_FOR_TEXT = 600;

// Thresholds for quality assessment (tuned for text readability)
const LOW_CONTRAST_THRESHOLD = 120; // Out of 255 (min/max pixel value spread)
const LOW_SHARPNESS_STD_DEV_THRESHOLD = 30; // Heuristic for average channel standard deviation

// Upscaling parameters for traditional resizing (when low resolution is detected)
const TRADITIONAL_UPSCALE_MULTIPLIER = 2; // e.g., 2x upscaling for detected low resolution
const TRADITIONAL_UPSCALE_MIN_TARGET_WIDTH = 1600; // Even higher target for text clarity
const TRADITIONAL_UPSCALE_MIN_TARGET_HEIGHT = 1200;

// General image processing parameters
const DEFAULT_BRIGHTNESS_BOOST = 1.05;
const DEFAULT_SATURATION_REDUCTION = 0.9;
const DEFAULT_GAMMA_CORRECTION = 1.1; // Slight gamma correction for midtones
const DEFAULT_JPEG_QUALITY = 90; // Balanced quality for file size and clarity

// Sharpening parameters for blur correction
const SHARPEN_SIGMA = 1.0; // Less aggressive for fine text
const SHARPEN_M1 = 1;
const SHARPEN_M2 = 2;
const SHARPEN_X1 = 1;
const SHARPEN_Y2 = 10;
const SHARPEN_Y3 = 20;
//const SHARPEN_FLAT = 1;
//const SHARPEN_JAGGED = 2;

interface ImageProcessingOptions {
  // Allows explicit control over certain enhancements, overriding automatic detection
  enhanceContrast?: boolean;
  normalizeColors?: boolean;
  // Note: 'upscale' here will now trigger traditional sharp.resize upscaling if low resolution is detected.
  upscale?: boolean;
  // removeBackground is not implemented in this version, but kept for interface consistency
  removeBackground?: boolean;
}

export interface ImageQualityAssessment {
  quality: 'high' | 'medium' | 'low';
  issues: string[];
  recommendations: string[];
  metrics: { // Added for more detailed insight during assessment
    width?: number;
    height?: number;
    contrastRange?: number;
    avgStdDev?: number; // For sharpness
  };
}

export class ImagePreprocessor {
  /**
   * Main preprocessing pipeline for schedule images with quality assessment
   */
  async preprocessScheduleImage(
    inputBuffer: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<{ processedBuffer: Buffer; qualityAssessment: ImageQualityAssessment }> {
    // 1. Assess image quality first
    const qualityAssessment = await this.assessImageQuality(inputBuffer);

    // 2. Apply adaptive preprocessing based on quality and options
    const processedBuffer = await this.adaptivePreprocessing(inputBuffer, qualityAssessment, options);

    return { processedBuffer, qualityAssessment };
  }

  /**
   * Assess image quality and identify issues
   */
  async assessImageQuality(buffer: Buffer): Promise<ImageQualityAssessment> {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const stats = await image.stats();

    const issues: string[] = [];
    const recommendations: string[] = [];
    const metrics: ImageQualityAssessment['metrics'] = {
      width: metadata.width,
      height: metadata.height
    };

    // Resolution check
    if (!metadata.width || !metadata.height || metadata.width < MIN_IMAGE_WIDTH_FOR_TEXT || metadata.height < MIN_IMAGE_HEIGHT_FOR_TEXT) {
      issues.push('Low resolution');
      // Updated recommendation to reflect traditional upscaling
      recommendations.push('Apply traditional image upscaling');
    }

    // Contrast analysis using channel min/max (more direct than entropy for contrast)
    const minBrightness = stats.channels.reduce((min, c) => Math.min(min, c.min || 255), 255);
    const maxBrightness = stats.channels.reduce((max, c) => Math.max(max, c.max || 0), 0);
    const contrastRange = maxBrightness - minBrightness;
    metrics.contrastRange = contrastRange;

    if (contrastRange < LOW_CONTRAST_THRESHOLD) {
      issues.push('Low contrast');
      recommendations.push('Apply contrast enhancement');
    }

    // Sharpness estimation (basic check using standard deviation of pixel values)
    const channelStats = stats.channels || [];
    const avgStdDev = channelStats.reduce((sum, channel) => sum + (channel.stdev || 0), 0) / channelStats.length;
    metrics.avgStdDev = avgStdDev;

    if (avgStdDev < LOW_SHARPNESS_STD_DEV_THRESHOLD) {
      issues.push('Image blur detected');
      recommendations.push('Apply sharpening filter');
    }

    const quality = issues.length === 0 ? 'high' :
      issues.length <= 2 ? 'medium' : 'low';

    return { quality, issues, recommendations, metrics };
  }

  /**
   * Apply adaptive preprocessing based on quality assessment and options
   */
  async adaptivePreprocessing(
    buffer: Buffer,
    qualityAssessment: ImageQualityAssessment,
    options: ImageProcessingOptions
  ): Promise<Buffer> {
    let processor = sharp(buffer);
    let metadata = await processor.metadata(); // Get initial metadata

    // 1. Handle resolution (upscaling or downscaling) first
    // If low resolution is detected AND upscaling is allowed/requested
    if (qualityAssessment.issues.includes('Low resolution') && options.upscale !== false) { // Default to upscale if not explicitly false
      processor = processor.resize(
        Math.max(TRADITIONAL_UPSCALE_MIN_TARGET_WIDTH, (metadata.width || 0) * TRADITIONAL_UPSCALE_MULTIPLIER),
        Math.max(TRADITIONAL_UPSCALE_MIN_TARGET_HEIGHT, (metadata.height || 0) * TRADITIONAL_UPSCALE_MULTIPLIER),
        {
          kernel: sharp.kernel.lanczos3, // Best quality traditional resampling
          withoutEnlargement: false // Allow enlargement
        }
      );
      metadata = await processor.metadata(); // Update metadata after resize
    } else if (metadata.height && metadata.height > TRADITIONAL_UPSCALE_MIN_TARGET_HEIGHT) { // If image is too tall, downscale
      // Downscale to a reasonable maximum height to manage token costs with LLMs
      processor = processor.resize(null, TRADITIONAL_UPSCALE_MIN_TARGET_HEIGHT, {
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: true // Only shrink if larger
      });
      metadata = await processor.metadata(); // Update metadata after resize
    }


    // 2. Apply contrast enhancement based on detection or option
    if (qualityAssessment.issues.includes('Low contrast') || options.enhanceContrast) {
      processor = processor
        .normalize() // Auto-adjust contrast by stretching histogram
        .gamma(DEFAULT_GAMMA_CORRECTION); // Boost midtones
    }

    // 3. Apply sharpening for blur detection
    if (qualityAssessment.issues.includes('Image blur detected')) {
      processor = processor.sharpen({
        sigma: SHARPEN_SIGMA,
        m1: SHARPEN_M1,
        m2: SHARPEN_M2,
        x1: SHARPEN_X1,
        y2: SHARPEN_Y2,
        y3: SHARPEN_Y3
      });
    }

    // 4. Apply general modulation (brightness, saturation) for text readability
    // Saturation reduction can be conditional if `normalizeColors` option is used
    processor = processor.modulate({
      brightness: DEFAULT_BRIGHTNESS_BOOST,
      saturation: options.normalizeColors ? DEFAULT_SATURATION_REDUCTION : 1.0, // Reduce saturation if requested
      hue: 0 // Keep hue as is
    });

    // 5. Final output format (JPEG for LLM compatibility and size)
    return processor.jpeg({
      quality: DEFAULT_JPEG_QUALITY,
      progressive: false,
      mozjpeg: true // Better compression
    }).toBuffer();
  }

  /**
   * Provides a standardized preprocessing for fallback strategies that don't need
   * full quality assessment or adaptive logic.
   */
  async standardizeImage(inputBuffer: Buffer): Promise<Buffer> {
    let processor = sharp(inputBuffer);
    const metadata = await processor.metadata();

    // Apply a general set of good practices for readability
    processor = processor
      .normalize()
      .gamma(DEFAULT_GAMMA_CORRECTION)
      .sharpen({ sigma: SHARPEN_SIGMA }) // Apply some default sharpening
      .modulate({ brightness: DEFAULT_BRIGHTNESS_BOOST, saturation: DEFAULT_SATURATION_REDUCTION });

    // Ensure a reasonable max dimension, but only shrink if larger
    if (metadata.height && metadata.height > TRADITIONAL_UPSCALE_MIN_TARGET_HEIGHT) {
      processor = processor.resize(null, TRADITIONAL_UPSCALE_MIN_TARGET_HEIGHT, {
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: true
      });
    } else if (metadata.width && metadata.width < MIN_IMAGE_WIDTH_FOR_TEXT && metadata.height && metadata.height < MIN_IMAGE_HEIGHT_FOR_TEXT) {
      // If image is very small, upscale it traditionally even if not "low resolution" issue
      processor = processor.resize(
        Math.max(TRADITIONAL_UPSCALE_MIN_TARGET_WIDTH, metadata.width * TRADITIONAL_UPSCALE_MULTIPLIER),
        Math.max(TRADITIONAL_UPSCALE_MIN_TARGET_HEIGHT, metadata.height * TRADITIONAL_UPSCALE_MULTIPLIER),
        {
          kernel: sharp.kernel.lanczos3,
          withoutEnlargement: false
        }
      );
    }

    return processor.jpeg({ quality: DEFAULT_JPEG_QUALITY, progressive: false, mozjpeg: true }).toBuffer();
  }

  // Removed:
  // - normalizeImage: Its logic is now integrated directly or handled by standardizeImage/adaptivePreprocessing.
  // - enhanceTextReadability: Its logic is integrated directly into adaptivePreprocessing.
  // - normalizeColors: Its logic is integrated directly into adaptivePreprocessing.
  // - preprocessLowQualityImage: Removed canvas-based processing as sharp is preferred.
}

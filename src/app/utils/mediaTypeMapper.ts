/**
 * Media Type Mapping for Azure Service Bus
 *
 * Maps various audio MIME types to the supported MediaType values
 * for the Service Bus voice-to-text processing pipeline.
 */

/**
 * Supported MediaType values for Azure Service Bus
 */
export type SupportedMediaType =
  | "audio/mp3"
  | "audio/wav"
  | "audio/ogg"
  | "audio/pcm"
  | "audio/ulaw"
  | "audio/alaw";

/**
 * Map a MIME type to a supported MediaType for Azure Service Bus
 *
 * @param mimeType - The MIME type from the audio file (e.g., "audio/webm", "audio/mpeg")
 * @returns The corresponding supported MediaType
 */
export function mapToSupportedMediaType(mimeType: string): SupportedMediaType {
  const normalizedType = mimeType.toLowerCase().trim();

  // WAV/PCM formats
  if (normalizedType.includes("wav")) {
    return "audio/wav";
  }
  if (normalizedType.includes("pcm") || normalizedType.includes("l16")) {
    return "audio/pcm";
  }

  // OGG/Opus formats
  if (normalizedType.includes("ogg") || normalizedType.includes("opus")) {
    return "audio/ogg";
  }

  // WebM (typically Opus codec) -> map to OGG
  if (normalizedType.includes("webm")) {
    return "audio/ogg";
  }

  // MP3/MPEG formats
  if (normalizedType.includes("mp3") || normalizedType.includes("mpeg")) {
    return "audio/mp3";
  }

  // MP4/AAC/M4A -> map to MP3 (transcoding fallback)
  if (normalizedType.includes("mp4") || normalizedType.includes("aac") || normalizedType.includes("m4a")) {
    return "audio/mp3";
  }

  // G.711 μ-law
  if (normalizedType.includes("ulaw") || normalizedType.includes("pcmu")) {
    return "audio/ulaw";
  }

  // G.711 A-law
  if (normalizedType.includes("alaw") || normalizedType.includes("pcma")) {
    return "audio/alaw";
  }

  // Default fallback to MP3 (most compatible)
  console.warn(`⚠️ Unknown MIME type "${mimeType}", defaulting to audio/mp3`);
  return "audio/mp3";
}

/**
 * Generate a unique MapId for tracking voice-to-text requests
 *
 * @returns A unique identifier in the format "map_{timestamp}_{random}"
 */
export function generateMapId(): string {
  return `map_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a Service Bus payload for voice-to-text processing
 *
 * @param params - Payload parameters
 * @returns The formatted Service Bus payload
 */
export interface VoiceToTextPayload {
  Command: number;
  BlobUrl: string;
  FileName: string;
  MediaType: SupportedMediaType;
  UserId: number;
  Language: string;
  MapId: string;
  CreatedUtc: string;
}

export function createVoiceToTextPayload(params: {
  blobUrl: string;
  fileName: string;
  mimeType: string;
  userId: number;
  language?: string;
}): VoiceToTextPayload {
  return {
    Command: 1, // 1 = voice-to-text processing
    BlobUrl: params.blobUrl,
    FileName: params.fileName,
    MediaType: mapToSupportedMediaType(params.mimeType),
    UserId: params.userId,
    Language: params.language || "english",
    MapId: generateMapId(),
    CreatedUtc: new Date().toISOString()
  };
}

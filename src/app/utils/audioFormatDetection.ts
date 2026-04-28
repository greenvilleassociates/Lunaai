/**
 * Audio Format Detection and Selection Utilities
 *
 * Intelligently selects the best audio format for voice recording
 * based on platform, browser capabilities, and user preferences.
 */

export interface AudioFormatConfig {
  mimeType: string;
  fileExtension: string;
  description: string;
  quality: string;
}

export interface PlatformInfo {
  os: 'windows10' | 'windows11' | 'mac' | 'ios' | 'android' | 'linux' | 'unknown';
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'samsung' | 'unknown';
  isMobile: boolean;
}

/**
 * Detect the current platform and browser
 */
export function detectPlatform(): PlatformInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  let os: PlatformInfo['os'] = 'unknown';
  let browser: PlatformInfo['browser'] = 'unknown';
  let isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);

  // Detect OS
  if (/iphone|ipad|ipod/.test(userAgent)) {
    os = 'ios';
  } else if (/mac/.test(platform)) {
    os = 'mac';
  } else if (/android/.test(userAgent)) {
    os = 'android';
  } else if (/win/.test(platform)) {
    // Try to detect Windows version
    if (userAgent.includes('windows nt 10.0')) {
      // Windows 10 or 11 - need to check build number
      os = 'windows11'; // Default to 11 for modern systems
    } else if (userAgent.includes('windows nt 6.3') || userAgent.includes('windows nt 6.2')) {
      os = 'windows10';
    } else {
      os = 'windows10'; // Default
    }
  } else if (/linux/.test(platform)) {
    os = 'linux';
  }

  // Detect Browser
  if (userAgent.includes('edg/')) {
    browser = 'edge';
  } else if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    browser = 'chrome';
  } else if (userAgent.includes('firefox')) {
    browser = 'firefox';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    browser = 'safari';
  } else if (userAgent.includes('opera') || userAgent.includes('opr/')) {
    browser = 'opera';
  } else if (userAgent.includes('samsungbrowser')) {
    browser = 'samsung';
  }

  return { os, browser, isMobile };
}

/**
 * Get platform-optimized audio format priority list
 * WAV format is prioritized as the default for best Azure Speech-to-Text accuracy
 */
export function getPlatformOptimizedFormats(platform: PlatformInfo): AudioFormatConfig[] {
  const formats: AudioFormatConfig[] = [];

  // All platforms - prefer WAV/PCM for best speech-to-text accuracy
  // WAV is Microsoft's recommended format for Azure Speech Services

  // iOS/Safari
  if (platform.os === 'ios' || platform.browser === 'safari') {
    formats.push(
      { mimeType: 'audio/wav', fileExtension: 'wav', description: 'WAV/PCM 16kHz', quality: 'Lossless' },
      { mimeType: 'audio/mp4', fileExtension: 'mp4', description: 'MP4/AAC', quality: 'High' },
      { mimeType: 'audio/mp4;codecs=mp4a.40.2', fileExtension: 'mp4', description: 'MP4/AAC (LC)', quality: 'High' },
      { mimeType: 'audio/webm;codecs=opus', fileExtension: 'webm', description: 'WebM/Opus', quality: 'High' }
    );
  }
  // Android
  else if (platform.os === 'android') {
    formats.push(
      { mimeType: 'audio/wav', fileExtension: 'wav', description: 'WAV/PCM 16kHz', quality: 'Lossless' },
      { mimeType: 'audio/webm;codecs=opus', fileExtension: 'webm', description: 'WebM/Opus', quality: 'High' },
      { mimeType: 'audio/webm', fileExtension: 'webm', description: 'WebM', quality: 'High' },
      { mimeType: 'audio/mp4', fileExtension: 'mp4', description: 'MP4/AAC', quality: 'High' },
      { mimeType: 'audio/ogg;codecs=opus', fileExtension: 'ogg', description: 'OGG/Opus', quality: 'High' }
    );
  }
  // Chrome/Edge on desktop
  else if (platform.browser === 'chrome' || platform.browser === 'edge') {
    formats.push(
      { mimeType: 'audio/wav', fileExtension: 'wav', description: 'WAV/PCM 16kHz', quality: 'Lossless' },
      { mimeType: 'audio/webm;codecs=opus', fileExtension: 'webm', description: 'WebM/Opus', quality: 'High' },
      { mimeType: 'audio/webm', fileExtension: 'webm', description: 'WebM', quality: 'High' },
      { mimeType: 'audio/ogg;codecs=opus', fileExtension: 'ogg', description: 'OGG/Opus', quality: 'High' }
    );
  }
  // Firefox
  else if (platform.browser === 'firefox') {
    formats.push(
      { mimeType: 'audio/wav', fileExtension: 'wav', description: 'WAV/PCM 16kHz', quality: 'Lossless' },
      { mimeType: 'audio/ogg;codecs=opus', fileExtension: 'ogg', description: 'OGG/Opus', quality: 'High' },
      { mimeType: 'audio/webm;codecs=opus', fileExtension: 'webm', description: 'WebM/Opus', quality: 'High' }
    );
  }
  // Default fallback
  else {
    formats.push(
      { mimeType: 'audio/wav', fileExtension: 'wav', description: 'WAV/PCM 16kHz', quality: 'Lossless' },
      { mimeType: 'audio/webm;codecs=opus', fileExtension: 'webm', description: 'WebM/Opus', quality: 'High' },
      { mimeType: 'audio/webm', fileExtension: 'webm', description: 'WebM', quality: 'Medium' },
      { mimeType: 'audio/ogg;codecs=opus', fileExtension: 'ogg', description: 'OGG/Opus', quality: 'High' },
      { mimeType: 'audio/mp4', fileExtension: 'mp4', description: 'MP4/AAC', quality: 'High' }
    );
  }

  // Always add basic fallbacks
  formats.push(
    { mimeType: 'audio/mpeg', fileExtension: 'mp3', description: 'MP3', quality: 'Medium' },
    { mimeType: '', fileExtension: 'webm', description: 'Default', quality: 'Unknown' }
  );

  return formats;
}

/**
 * Check if a MIME type is supported by the browser
 */
export function isMimeTypeSupported(mimeType: string): boolean {
  if (!mimeType) return true; // Empty string = browser default

  try {
    return MediaRecorder.isTypeSupported(mimeType);
  } catch (error) {
    console.warn(`Error checking MIME type support for ${mimeType}:`, error);
    return false;
  }
}

/**
 * Get the best supported audio format based on platform and user preference
 */
export function getBestAudioFormat(userPreference?: string): AudioFormatConfig {
  const platform = detectPlatform();
  console.log('🎙️ Platform detected:', platform);

  // Get platform-optimized format priority
  const platformFormats = getPlatformOptimizedFormats(platform);

  // If user has a preference from settings, try that first
  if (userPreference) {
    const preferredFormat = mapUserPreferenceToFormat(userPreference, platform);
    if (preferredFormat && isMimeTypeSupported(preferredFormat.mimeType)) {
      console.log('✓ Using user preferred format:', preferredFormat);
      return preferredFormat;
    }
  }

  // Find first supported format from platform-optimized list
  for (const format of platformFormats) {
    if (isMimeTypeSupported(format.mimeType)) {
      console.log('✓ Selected best format:', format);
      return format;
    }
  }

  // Final fallback - browser default
  console.warn('⚠️ No specific format supported, using browser default');
  return {
    mimeType: '',
    fileExtension: 'webm',
    description: 'Browser Default',
    quality: 'Unknown'
  };
}

/**
 * Map user preference setting to audio format
 */
function mapUserPreferenceToFormat(preference: string, platform: PlatformInfo): AudioFormatConfig | null {
  const formatMap: Record<string, AudioFormatConfig> = {
    'wav-16khz': {
      mimeType: 'audio/wav',
      fileExtension: 'wav',
      description: 'WAV/PCM 16kHz',
      quality: 'Lossless'
    },
    'wav-8khz': {
      mimeType: 'audio/wav',
      fileExtension: 'wav',
      description: 'WAV/PCM 8kHz',
      quality: 'Medium'
    },
    'mp3': {
      mimeType: 'audio/mpeg',
      fileExtension: 'mp3',
      description: 'MP3',
      quality: 'Medium'
    },
    'ogg-opus': {
      mimeType: 'audio/ogg;codecs=opus',
      fileExtension: 'ogg',
      description: 'OGG/Opus',
      quality: 'High'
    },
    'raw-pcm': {
      mimeType: 'audio/wav',
      fileExtension: 'wav',
      description: 'Raw PCM',
      quality: 'Lossless'
    }
  };

  return formatMap[preference] || null;
}

/**
 * Get all supported formats for the current platform
 */
export function getSupportedFormats(): AudioFormatConfig[] {
  const platform = detectPlatform();
  const platformFormats = getPlatformOptimizedFormats(platform);

  return platformFormats.filter(format => isMimeTypeSupported(format.mimeType));
}

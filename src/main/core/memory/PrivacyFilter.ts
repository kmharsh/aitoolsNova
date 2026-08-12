export class PrivacyFilter {
  // Regex to catch things that look like API keys, secrets, or passwords
  private static sensitiveRegex = [
    /sk-[a-zA-Z0-9]{32,}/g, // OpenAI/Anthropic keys
    /gh[po]_[a-zA-Z0-9]{36,}/g, // GitHub tokens
    /password\s*[:=]\s*['"]?[^'"\s]+['"]?/gi, // pass=...
    /bearer\s+[a-zA-Z0-9\-\._~\+\/]+=*/gi // JWT tokens
  ];

  static sanitize(text: string): string {
    let sanitized = text;
    for (const regex of this.sensitiveRegex) {
      sanitized = sanitized.replace(regex, '[REDACTED_SECRET]');
    }
    return sanitized;
  }

  static shouldLogAudio(explicitlyEnabled: boolean): boolean {
    return explicitlyEnabled;
  }
}

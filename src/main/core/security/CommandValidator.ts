export class CommandValidator {
  private static ALLOWLIST = [
    /^npm\s+(run\s+)?(test|lint|build|dev)$/,
    /^yarn\s+(test|lint|build|dev)$/,
    /^pnpm\s+(test|lint|build|dev)$/,
    /^git\s+(status|diff|add\s+\.|commit\s+-m.*)$/
  ];

  static validate(command: string): void {
    const isAllowed = this.ALLOWLIST.some(regex => regex.test(command.trim()));
    if (!isAllowed) {
      throw new Error(`Security Exception: Command execution blocked by allowlist -> "${command}"`);
    }
  }
}

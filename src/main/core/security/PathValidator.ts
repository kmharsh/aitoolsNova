import * as path from 'path';

export class PathValidator {
  private allowedRoots: string[];
  private blacklistedNames: Set<string>;

  constructor(allowedRoots: string[] = []) {
    // Default to resolving allowed roots to absolute paths
    this.allowedRoots = allowedRoots.map(root => path.resolve(root));
    
    // Hardcoded strict blocklist for secrets and system files
    this.blacklistedNames = new Set([
      '.env',
      'credentials',
      'id_rsa',
      'id_ed25519',
      'secrets.json',
      'config.json',
      '.git',
      '.ssh'
    ]);
  }

  /**
   * Resolves the path and ensures it does not attempt directory traversal
   * outside of the allowed roots, and doesn't touch blacklisted files.
   */
  validate(targetPath: string): string {
    const resolvedPath = path.resolve(targetPath);

    // 1. Check for basic traversal attacks manually (though path.resolve handles most)
    if (targetPath.includes('..') && !this.isWithinAllowedRoots(resolvedPath)) {
      throw new Error(`Security Exception: Directory traversal attempt detected -> ${targetPath}`);
    }

    // 2. Check Blacklist
    const basename = path.basename(resolvedPath).toLowerCase();
    if (this.blacklistedNames.has(basename)) {
      throw new Error(`Security Exception: Access to protected file blocked -> ${basename}`);
    }

    // 3. Windows System Protection
    if (resolvedPath.toLowerCase().startsWith('c:\\windows') || 
        resolvedPath.toLowerCase().startsWith('c:\\program files')) {
      throw new Error(`Security Exception: Access to Windows system directories is blocked.`);
    }

    // 4. Check Allowed Roots
    if (!this.isWithinAllowedRoots(resolvedPath)) {
      throw new Error(`Security Exception: Path is outside of allowed directories -> ${resolvedPath}`);
    }

    return resolvedPath;
  }

  private isWithinAllowedRoots(resolvedPath: string): boolean {
    if (this.allowedRoots.length === 0) return true; // If empty, assume full C:\Users\ minus system dirs is allowed.
    return this.allowedRoots.some(root => {
      const relative = path.relative(root, resolvedPath);
      // If the relative path does not start with '..', it is inside the root
      return !relative.startsWith('..') && !path.isAbsolute(relative);
    });
  }
}

// Global instance (configured for user profile by default)
export const pathValidator = new PathValidator([
  process.env.USERPROFILE || 'C:\\Users'
]);

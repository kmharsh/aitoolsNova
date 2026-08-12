import { BaseAgent } from './BaseAgent';

export class BrowserAgent extends BaseAgent {
  name = 'BrowserAgent';
  description = 'Handles web navigation, DOM extraction, and downloads via Playwright.';
}

export class DocumentAgent extends BaseAgent {
  name = 'DocumentAgent';
  description = 'Handles parsing, chunking, and comparing complex documents (PDFs, CSVs).';
}

export class DeveloperAgent extends BaseAgent {
  name = 'DeveloperAgent';
  description = 'Handles repository inspection, git commits, and code modification.';
}

export class FileAgent extends BaseAgent {
  name = 'FileAgent';
  description = 'Handles secure file system operations (copy, move, delete).';
}

export class CommunicationAgent extends BaseAgent {
  name = 'CommunicationAgent';
  description = 'Interfaces with the Voice TTS/STT and Memory databases.';
}

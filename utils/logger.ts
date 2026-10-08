export class ScenarioLogger {
  private readonly entries: string[] = [];

  info(message: string): void {
    this.write('INFO', message);
  }

  warn(message: string): void {
    this.write('WARN', message);
  }

  error(message: string): void {
    this.write('ERROR', message);
  }

  toText(): string {
    return this.entries.join('\n');
  }

  private write(level: string, message: string): void {
    const line = `${new Date().toISOString()} [${level}] ${message}`;
    this.entries.push(line);
    console.log(line);
  }
}

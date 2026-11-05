export interface Command {
  id: string;
  label: string;
  hint?: string;
  keywords?: string[];
  group?: string;
  perform: () => void;
}

/**
 * Case-insensitive substring filter over a command's label and keywords.
 * Commands whose label starts with the query rank first, then label
 * substring matches, then keyword matches. Empty query returns all.
 */
export function filterCommands(commands: Command[], query: string): Command[] {
  const q = query.trim().toLowerCase();
  if (!q) return commands;

  const scored: { command: Command; score: number }[] = [];

  for (const command of commands) {
    const label = command.label.toLowerCase();
    let score = -1;

    if (label.startsWith(q)) {
      score = 3;
    } else if (label.includes(q)) {
      score = 2;
    } else if (command.keywords?.some((k) => k.toLowerCase().includes(q))) {
      score = 1;
    }

    if (score >= 0) scored.push({ command, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .map((s) => s.command);
}

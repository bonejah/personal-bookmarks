import { describe, it, expect } from 'vitest';
import { filterCommands, type Command } from './commandFilter';

const cmd = (id: string, label: string, keywords?: string[]): Command => ({
  id,
  label,
  keywords,
  perform: () => {},
});

const commands: Command[] = [
  cmd('add', 'Add Bookmark', ['new', 'link']),
  cmd('cat', 'Create Subject', ['folder', 'category']),
  cmd('theme', 'Toggle Theme', ['dark', 'light']),
];

describe('filterCommands', () => {
  it('returns all commands for an empty query', () => {
    expect(filterCommands(commands, '')).toHaveLength(3);
  });

  it('matches by label substring', () => {
    const r = filterCommands(commands, 'subject');
    expect(r.map((c) => c.id)).toEqual(['cat']);
  });

  it('matches by keyword when the label does not match', () => {
    const r = filterCommands(commands, 'folder');
    expect(r.map((c) => c.id)).toEqual(['cat']);
  });

  it('ranks label-prefix matches above keyword matches', () => {
    const r = filterCommands(commands, 'add');
    expect(r[0].id).toBe('add');
  });

  it('is case-insensitive', () => {
    expect(filterCommands(commands, 'THEME').map((c) => c.id)).toEqual(['theme']);
  });

  it('returns nothing when there is no match', () => {
    expect(filterCommands(commands, 'zzz')).toEqual([]);
  });
});

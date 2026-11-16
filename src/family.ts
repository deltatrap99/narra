export const FAMILY_CAPACITY = 4;
export type FamilyMember = { id: string; name: string };

export function restoreFamilyMembers(value: unknown): FamilyMember[] {
  if (!Array.isArray(value)) return [];
  const members: FamilyMember[] = [];
  for (const item of value) {
    if (item && typeof item.id === 'string' && item.id.length <= 50 && item.id && typeof item.name === 'string' && item.name.trim() && !members.some(member => member.id === item.id)) members.push({ id: item.id, name: item.name.trim().slice(0, 35) });
    if (members.length === FAMILY_CAPACITY - 1) break;
  }
  return members;
}
export function familyNameError(name: string, ownerName: string, members: FamilyMember[]): 'empty' | 'full' | 'duplicate' | null {
  const normalized = name.trim().normalize('NFC').toLocaleLowerCase();
  if (!normalized) return 'empty';
  if (members.length >= FAMILY_CAPACITY - 1) return 'full';
  if ([ownerName, ...members.map(member => member.name)].some(value => value.trim().normalize('NFC').toLocaleLowerCase() === normalized)) return 'duplicate';
  return null;
}

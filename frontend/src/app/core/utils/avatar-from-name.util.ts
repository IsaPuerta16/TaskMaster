import type { User } from '@core/models';

const MALE_AVATARS = [
  'assets/avatars/male-1.png',
  'assets/avatars/male-2.png',
  'assets/avatars/male-3.png',
] as const;

const FEMALE_AVATARS = [
  'assets/avatars/female-1.png',
  'assets/avatars/female-2.png',
  'assets/avatars/female-3.png',
] as const;

const FEMALE_FIRST_NAMES = new Set([
  'isabela',
  'maria',
  'ana',
  'laura',
  'sofia',
  'valentina',
  'camila',
  'daniela',
  'paula',
  'andrea',
  'natalia',
  'carolina',
  'juliana',
  'diana',
  'sara',
  'lucia',
  'elena',
  'claudia',
  'patricia',
  'monica',
  'angela',
  'catalina',
  'mariana',
  'gabriela',
  'fernanda',
  'alejandra',
  'adriana',
  'veronica',
  'ximena',
  'manuela',
]);

const MALE_FIRST_NAMES = new Set([
  'rafael',
  'darwin',
  'daniel',
  'juan',
  'carlos',
  'andres',
  'felipe',
  'santiago',
  'sebastian',
  'nicolas',
  'diego',
  'alejandro',
  'miguel',
  'jose',
  'luis',
  'pedro',
  'mario',
  'oscar',
  'eduardo',
  'ricardo',
  'fernando',
  'jorge',
  'pablo',
  'camilo',
  'esteban',
  'german',
  'cristian',
  'david',
  'ivan',
  'hector',
]);

const MALE_A_ENDINGS = new Set([
  'garcia',
  'borja',
  'joshua',
  'nikita',
  'luca',
  'mustafa',
]);

export type InferredGender = 'male' | 'female';

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '');
}

function extractFirstName(fullName: string, firstName?: string | null): string {
  const fromField = firstName?.trim();
  if (fromField) return fromField;
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export function inferGenderFromName(
  fullName: string,
  firstName?: string | null,
): InferredGender {
  const first = stripAccents(extractFirstName(fullName, firstName).toLowerCase());

  if (!first) return 'male';
  if (FEMALE_FIRST_NAMES.has(first)) return 'female';
  if (MALE_FIRST_NAMES.has(first)) return 'male';
  if (first.endsWith('a') && !MALE_A_ENDINGS.has(first)) return 'female';
  return 'male';
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function avatarUrlFromName(
  fullName: string,
  seed?: string,
  firstName?: string | null,
): string {
  const gender = inferGenderFromName(fullName, firstName);
  const pool = gender === 'female' ? FEMALE_AVATARS : MALE_AVATARS;
  const key = seed?.trim() || fullName.trim() || 'default';
  return pool[hashSeed(key) % pool.length];
}


export function resolveUserAvatarUrl(user: User | null | undefined): string {
  if (!user) return MALE_AVATARS[0];
  if (user.avatarUrl?.trim()) return user.avatarUrl.trim();
  return avatarUrlFromName(
    user.fullName,
    user.id || user.email,
    user.firstName,
  );
}

import { z } from 'zod';
import { MoodType } from '@/types';

// 허용된 mood 값 (화이트리스트)
const VALID_MOODS: MoodType[] = ['hearty', 'light', 'simple', 'spicy', 'cool', 'warm', 'rich', 'protein'];

export const coordinatesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const searchParamsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(3000).default(2000),
  category: z.string().optional(),
});

export type CoordinatesInput = z.infer<typeof coordinatesSchema>;
export type SearchParamsInput = z.infer<typeof searchParamsSchema>;

export const validateCoordinates = (
  lat: unknown,
  lng: unknown
): { success: true; data: CoordinatesInput } | { success: false; error: string } => {
  const result = coordinatesSchema.safeParse({ lat, lng });
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: '유효하지 않은 좌표입니다' };
};

export const validateSearchParams = (
  params: Record<string, unknown>
): { success: true; data: SearchParamsInput } | { success: false; error: string } => {
  const result = searchParamsSchema.safeParse(params);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: '유효하지 않은 검색 파라미터입니다' };
};

/**
 * moods 파라미터 검증 (화이트리스트 기반)
 * 유효하지 않은 mood 값은 필터링하여 반환
 */
export const validateMoods = (moodsParam: string | null): MoodType[] => {
  if (!moodsParam) {
    return [];
  }

  const requestedMoods = moodsParam.split(',');

  // 화이트리스트에 있는 값만 필터링
  const validMoods = requestedMoods.filter(
    (mood): mood is MoodType => VALID_MOODS.includes(mood as MoodType)
  );

  return validMoods;
};

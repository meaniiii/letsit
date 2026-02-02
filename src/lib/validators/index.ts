import { z } from 'zod';

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

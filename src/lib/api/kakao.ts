import {
  KakaoPlace,
  KakaoSearchResponse,
  Restaurant,
  Coordinates,
  CATEGORY_KEYWORDS,
  CategoryFilter,
} from '@/types';
import {
  calculateWalkingTime,
  parseCategory,
  parseCategoryDetail,
} from '@/lib/utils';

const KAKAO_BASE_URL = 'https://dapi.kakao.com';

/**
 * 카카오 API 호출 래퍼
 */
const kakaoFetch = async <T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> => {
  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    throw new Error('KAKAO_REST_API_KEY is not defined');
  }

  const url = new URL(endpoint, KAKAO_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `KakaoAK ${apiKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Kakao API Error: ${res.status}`);
  }

  return res.json();
};

/**
 * 카카오 Place → Restaurant 변환
 */
const transformToRestaurant = (place: KakaoPlace): Restaurant => {
  const distance = parseInt(place.distance, 10);
  return {
    id: place.id,
    name: place.place_name,
    category: parseCategory(place.category_name),
    categoryDetail: parseCategoryDetail(place.category_name),
    distance,
    walkingTime: calculateWalkingTime(distance),
    address: place.road_address_name || place.address_name,
    phone: place.phone,
    url: place.place_url,
    position: {
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
    },
  };
};

/**
 * 카테고리 필터 적용
 */
const filterByCategory = (
  restaurants: Restaurant[],
  category: CategoryFilter
): Restaurant[] => {
  if (category === 'all') {
    return restaurants;
  }

  const keywords = CATEGORY_KEYWORDS[category];
  return restaurants.filter((r) =>
    keywords.some(
      (keyword) =>
        r.category.includes(keyword) || r.categoryDetail.includes(keyword)
    )
  );
};

/**
 * 주변 음식점 검색 (최대 30개)
 */
export const searchRestaurants = async (params: {
  coords: Coordinates;
  radius?: number;
  category?: CategoryFilter;
}): Promise<Restaurant[]> => {
  const { coords, radius = 1000, category = 'all' } = params;

  // 카카오 로컬 API - 카테고리 검색
  // FD6 = 음식점
  const data = await kakaoFetch<KakaoSearchResponse>(
    '/v2/local/search/category.json',
    {
      category_group_code: 'FD6',
      x: String(coords.lng),
      y: String(coords.lat),
      radius: String(radius),
      sort: 'distance',
      size: '15', // 한 페이지 최대 15개
      page: '1',
    }
  );

  // 2페이지까지 요청해서 최대 30개 확보
  let allPlaces = [...data.documents];

  if (!data.meta.is_end && data.meta.pageable_count > 15) {
    const page2 = await kakaoFetch<KakaoSearchResponse>(
      '/v2/local/search/category.json',
      {
        category_group_code: 'FD6',
        x: String(coords.lng),
        y: String(coords.lat),
        radius: String(radius),
        sort: 'distance',
        size: '15',
        page: '2',
      }
    );
    allPlaces = [...allPlaces, ...page2.documents];
  }

  // Restaurant 타입으로 변환
  let restaurants = allPlaces.map(transformToRestaurant);

  // 도보 10분 이내 필터링
  restaurants = restaurants.filter((r) => r.walkingTime <= 10);

  // 카테고리 필터 적용
  if (category !== 'all') {
    restaurants = filterByCategory(restaurants, category);
  }

  return restaurants;
};

/**
 * 키워드/주소 → 좌표 변환 (Geocoding)
 * 키워드 검색 API 사용 (장소명, 주소 모두 검색 가능)
 */
export const getCoordsFromAddress = async (
  query: string
): Promise<{ coords: Coordinates; address: string } | null> => {
  const data = await kakaoFetch<{
    documents: Array<{
      place_name: string;
      address_name: string;
      road_address_name: string;
      x: string;
      y: string;
    }>;
  }>('/v2/local/search/keyword.json', {
    query,
  });

  if (data.documents.length === 0) {
    return null;
  }

  const doc = data.documents[0];
  return {
    coords: {
      lat: parseFloat(doc.y),
      lng: parseFloat(doc.x),
    },
    address: doc.road_address_name || doc.address_name,
  };
};

/**
 * 좌표 → 주소 변환
 */
export const getAddressFromCoords = async (
  coords: Coordinates
): Promise<string> => {
  const data = await kakaoFetch<{
    documents: Array<{
      address: {
        address_name: string;
        region_1depth_name: string;
        region_2depth_name: string;
        region_3depth_name: string;
      };
    }>;
  }>('/v2/local/geo/coord2address.json', {
    x: String(coords.lng),
    y: String(coords.lat),
  });

  if (data.documents.length === 0) {
    return '위치를 찾을 수 없습니다';
  }

  const addr = data.documents[0].address;
  return `${addr.region_1depth_name} ${addr.region_2depth_name} ${addr.region_3depth_name}`;
};

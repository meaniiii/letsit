import {
  KakaoPlace,
  KakaoSearchResponse,
  Restaurant,
  Coordinates,
  CATEGORY_KEYWORDS,
  CategoryFilter,
  MoodType,
  MOOD_KEYWORDS,
} from '@/types';
import {
  calculateWalkingTime,
  parseCategory,
  parseCategoryDetail,
  getRandomItems,
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
    // 429: 일일 할당량 초과
    if (res.status === 429) {
      const error = new Error('RATE_LIMIT_EXCEEDED');
      error.name = 'RateLimitError';
      throw error;
    }
    throw new Error(`Kakao API Error: ${res.status}`);
  }

  return res.json();
};

/**
 * 카카오 Place → Restaurant 변환
 */
const transformToRestaurant = (
  place: KakaoPlace,
  matchedKeyword?: string
): Restaurant => {
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
    matchedKeyword,
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
 * 주변 음식점 검색
 * - 기분(mood)이 있으면: 해당 기분의 키워드들로 검색
 * - 기분이 없으면: 카테고리 검색 (완전 랜덤)
 */
export const searchRestaurants = async (params: {
  coords: Coordinates;
  radius?: number;
  category?: CategoryFilter;
  moods?: MoodType[];
}): Promise<Restaurant[]> => {
  const { coords, category = 'all', moods } = params;

  const POOL_SIZE = 30;
  const RADIUS = 1500;

  // place ID -> matched keyword 매핑
  const placeKeywordMap = new Map<string, string>();
  const allPlaces: KakaoPlace[] = [];
  const seenIds = new Set<string>();

  if (moods && moods.length > 0) {
    // 기분 기반 키워드 검색 (다중 기분의 키워드 합집합)
    const keywords = moods.flatMap((mood) => MOOD_KEYWORDS[mood]);
    // 중복 제거
    const uniqueKeywords = [...new Set(keywords)];

    for (const keyword of uniqueKeywords) {
      const response = await kakaoFetch<KakaoSearchResponse>(
        '/v2/local/search/keyword.json',
        {
          query: keyword,
          x: String(coords.lng),
          y: String(coords.lat),
          radius: String(RADIUS),
          size: '15',
          page: '1',
        }
      );

      for (const place of response.documents) {
        // 음식점 카테고리만 추가
        if (place.category_name.startsWith('음식점') && !seenIds.has(place.id)) {
          seenIds.add(place.id);
          allPlaces.push(place);
          placeKeywordMap.set(place.id, keyword); // 매칭된 키워드 저장
        }
      }
    }
  } else {
    // 카테고리 검색 (FD6: 음식점) - 완전 랜덤
    for (let page = 1; page <= 3; page++) {
      const response = await kakaoFetch<KakaoSearchResponse>(
        '/v2/local/search/category.json',
        {
          category_group_code: 'FD6',
          x: String(coords.lng),
          y: String(coords.lat),
          radius: String(RADIUS),
          size: '15',
          page: String(page),
        }
      );

      for (const place of response.documents) {
        if (!seenIds.has(place.id)) {
          seenIds.add(place.id);
          allPlaces.push(place);
        }
      }
    }
  }

  // Restaurant 타입으로 변환 (매칭된 키워드 포함)
  let restaurants = allPlaces.map((place) =>
    transformToRestaurant(place, placeKeywordMap.get(place.id))
  );

  // 도보 20분 이내 필터링
  restaurants = restaurants.filter((r) => r.walkingTime <= 20);

  // 제외할 카테고리 (간식, 아이스크림 등)
  const excludeCategories = ['간식', '아이스크림', '빙수', '디저트'];
  restaurants = restaurants.filter(
    (r) =>
      !excludeCategories.some(
        (exc) =>
          r.category.includes(exc) || r.categoryDetail.includes(exc)
      )
  );

  // 카테고리 필터 적용
  if (category !== 'all') {
    restaurants = filterByCategory(restaurants, category);
  }

  // 랜덤으로 30개 선택
  if (restaurants.length > POOL_SIZE) {
    restaurants = getRandomItems(restaurants, POOL_SIZE);
  }

  // 거리순 정렬
  restaurants.sort((a, b) => a.distance - b.distance);

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

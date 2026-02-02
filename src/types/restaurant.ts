// 카카오 로컬 API 원본 응답 타입
export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도 (longitude)
  y: string; // 위도 (latitude)
  place_url: string;
  distance: string;
}

export interface KakaoSearchResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
    same_name: {
      region: string[];
      keyword: string;
      selected_region: string;
    };
  };
}

// 프론트엔드용 맛집 타입
export interface Restaurant {
  id: string;
  name: string;
  category: string;
  categoryDetail: string;
  distance: number;
  walkingTime: number;
  address: string;
  phone: string;
  url: string;
  position: {
    lat: number;
    lng: number;
  };
}

// 좌표 타입
export interface Coordinates {
  lat: number;
  lng: number;
}

// API 응답 타입
export interface RestaurantsResponse {
  data: Restaurant[];
  meta: {
    total: number;
    poolSize: number;
  };
}

export interface ErrorResponse {
  error: string;
  code: string;
  status: number;
}

// 카테고리 필터 타입
export type CategoryFilter =
  | 'all'
  | 'korean'
  | 'chinese'
  | 'japanese'
  | 'western'
  | 'snack'
  | 'cafe';

export const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: '전체',
  korean: '한식',
  chinese: '중식',
  japanese: '일식',
  western: '양식',
  snack: '분식',
  cafe: '카페',
};

export const CATEGORY_KEYWORDS: Record<CategoryFilter, string[]> = {
  all: [],
  korean: ['한식', '한정식', '국밥', '찌개', '탕', '백반', '삼겹살', '갈비'],
  chinese: ['중식', '중국집', '짜장', '짬뽕'],
  japanese: ['일식', '초밥', '돈까스', '라멘', '우동'],
  western: ['양식', '파스타', '피자', '스테이크', '햄버거'],
  snack: ['분식', '떡볶이', '김밥', '라면'],
  cafe: ['카페', '커피', '디저트', '베이커리'],
};

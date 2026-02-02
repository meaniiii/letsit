'use client';

import { Restaurant } from '@/types';
import RestaurantCard from './RestaurantCard';
import { CardSkeleton } from '@/components/ui';

interface RestaurantListProps {
  restaurants: Restaurant[];
  isLoading?: boolean;
  onCardClick?: (restaurant: Restaurant) => void;
}

const RestaurantList = ({
  restaurants,
  isLoading = false,
  onCardClick,
}: RestaurantListProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">주변에 맛집이 없어요 😢</p>
        <p className="text-gray-400 text-sm mt-2">
          다른 카테고리를 선택해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
};

export default RestaurantList;

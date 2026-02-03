'use client';

import { Restaurant } from '@/types';
import { Card, Badge } from '@/components/ui';
import { formatDistance } from '@/lib/utils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: (restaurant: Restaurant) => void;
}

const RestaurantCard = ({ restaurant, onClick }: RestaurantCardProps) => {
  const handleClick = () => {
    onClick?.(restaurant);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(restaurant.url, '_blank');
  };

  return (
    <Card onClick={handleClick} className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate">
            {restaurant.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {restaurant.category}
            {restaurant.categoryDetail !== restaurant.category &&
              ` · ${restaurant.categoryDetail}`}
          </p>
        </div>
        <Badge className="ml-2 flex-shrink-0">
          도보 {restaurant.walkingTime}분
        </Badge>
      </div>

      <p className="text-sm text-gray-500 truncate">{restaurant.address}</p>

      {restaurant.matchedKeyword && (
        <p className="text-xs text-orange-500 mt-2">
          🔍 &quot;{restaurant.matchedKeyword}&quot;으로 찾음
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{formatDistance(restaurant.distance)}</span>
          {restaurant.phone && (
            <>
              <span>·</span>
              <span>{restaurant.phone}</span>
            </>
          )}
        </div>
        <button
          onClick={handleMapClick}
          className="text-xs text-orange-500 hover:text-orange-600 font-medium"
        >
          카카오맵 →
        </button>
      </div>
    </Card>
  );
};

export default RestaurantCard;

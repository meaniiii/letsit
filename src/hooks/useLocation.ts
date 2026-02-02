'use client';

import { useCallback } from 'react';
import { useRestaurantStore } from '@/stores/restaurantStore';

export const useLocation = () => {
  const {
    coords,
    address,
    locationLoading,
    locationError,
    setCoords,
    setAddress,
    setLocationLoading,
    setLocationError,
  } = useRestaurantStore();

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('브라우저가 위치 정보를 지원하지 않습니다');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const newCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setCoords(newCoords);

      // 주소 가져오기
      const res = await fetch(
        `/api/location?lat=${newCoords.lat}&lng=${newCoords.lng}`
      );
      const data = await res.json();

      if (data.address) {
        setAddress(data.address);
      }
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('위치 권한이 필요해요');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('위치 정보를 가져올 수 없습니다');
            break;
          case error.TIMEOUT:
            setLocationError('위치 요청 시간이 초과되었습니다');
            break;
          default:
            setLocationError('위치를 가져오는 중 오류가 발생했습니다');
        }
      } else {
        setLocationError('위치를 가져오는 중 오류가 발생했습니다');
      }
    } finally {
      setLocationLoading(false);
    }
  }, [setCoords, setAddress, setLocationLoading, setLocationError]);

  return {
    coords,
    address,
    isLoading: locationLoading,
    error: locationError,
    requestLocation,
  };
};

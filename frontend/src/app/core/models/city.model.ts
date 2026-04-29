export interface City {
  id: number;
  name: string;
  nameEn: string;
  country: string;
  province: string;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export enum CityStatus {
  VISITED = 'VISITED',
  WANT_TO_VISIT = 'WANT_TO_VISIT'
}

export interface UserCity {
  id: number;
  userId: number;
  cityId: number;
  cityName: string;
  cityNameEn: string;
  country: string;
  province: string;
  latitude: number;
  longitude: number;
  cityDescription: string;
  cityImageUrl: string;
  status: CityStatus;
  visitDate: string;
  rating: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddCityRequest {
  cityId: number;
  status: CityStatus;
  visitDate?: string;
  rating?: number;
  notes?: string;
}

export interface MapData {
  visitedCities: MapCity[];
  wantToVisitCities: MapCity[];
  stats: MapStats;
}

export interface MapCity {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  rating: number;
  notes: string;
}

export interface MapStats {
  visitedCount: number;
  wantToVisitCount: number;
  countriesCount: number;
}

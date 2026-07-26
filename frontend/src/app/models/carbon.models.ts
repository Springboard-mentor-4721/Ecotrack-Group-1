export interface PageableResponse<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface CarbonEntryResponse {
  id: number;
  subCategoryId: number;
  categoryId: number;
  categoryName: string;
  subType: string;
  quantity: number;
  unit: string;
  emissionKgco2e: number;
  entryDate: string; // ISO date string
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryEmissionResponse {
  categoryName: string;
  totalEmission: number;
  percentage: number;
}

export interface CarbonSummaryResponse {
  totalEmission: number;
  totalEntriesCount: number;
  categorySummaries: CategoryEmissionResponse[];
}

export interface CreateCarbonEntryRequest {
  categoryId: number;
  subCategoryId: number;
  quantity: number;
  unit: string;
  entryDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface UpdateCarbonEntryRequest {
  categoryId: number;
  subCategoryId: number;
  quantity: number;
  unit: string;
  entryDate: string; // YYYY-MM-DD
  notes?: string;
}


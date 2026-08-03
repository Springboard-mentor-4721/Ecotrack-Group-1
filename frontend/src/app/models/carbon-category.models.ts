export interface CarbonSubcategory {
  id: number;
  name: string;
  code: string;
}

export interface CarbonCategory {
  id: number;
  name: string;
  code: string;
  subcategories?: CarbonSubcategory[];
}

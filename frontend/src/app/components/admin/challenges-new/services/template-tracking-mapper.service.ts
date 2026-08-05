import { Injectable } from '@angular/core';
import { CarbonCategory, CarbonSubcategory } from '../../../../models/carbon-category.models';
import { TrackingSourceCode } from '../../../../models/challenge-template.model';

@Injectable({ providedIn: 'root' })
export class TemplateTrackingMapperService {

  public resolveAllowedSubcategoryIds(
    trackingSources: TrackingSourceCode[] | undefined,
    categories: CarbonCategory[]
  ): number[] {
    if (!trackingSources || trackingSources.length === 0) {
      return [];
    }

    const allSubcategories = categories.flatMap((c: any) => c.subCategories || c.subcategories || []);
    const resolvedIds: number[] = [];

    trackingSources.forEach(sourceCode => {
      // Find a subcategory that matches the source code
      // Since CarbonSubCategory only has a 'name' field, we match against it (case-insensitive)
      // or map specific codes to known names.
      const match = this.findSubcategoryForCode(sourceCode, allSubcategories);
      if (match) {
        resolvedIds.push(match.id);
      } else {
        console.warn(`TemplateTrackingMapper: Could not resolve tracking source '${sourceCode}' to a valid CarbonSubCategory ID.`);
      }
    });

    return resolvedIds;
  }

  private findSubcategoryForCode(code: TrackingSourceCode, subcategories: CarbonSubcategory[]): CarbonSubcategory | undefined {
    // Basic mapping dictionary for known codes to common names
    const codeToNameMap: Record<TrackingSourceCode, string[]> = {
      'BUS': ['bus'],
      'TRAIN': ['train', 'rail'],
      'METRO': ['metro', 'subway'],
      'WALK': ['walk', 'walking'],
      'CYCLE': ['cycle', 'cycling', 'bicycle', 'bike'],
      'CAR': ['car', 'petrol car', 'diesel car', 'taxi'],
      'ELECTRIC_CAR': ['electric car', 'ev'],
      'MOTORBIKE': ['motorbike', 'motorcycle'],
      'ELECTRICITY': ['electricity', 'grid electricity'],
      'WATER': ['water', 'mains water'],
      'RECYCLING': ['recycling', 'recycled'],
      'PLASTIC': ['plastic'],
      'PAPER': ['paper', 'cardboard'],
      'GLASS': ['glass'],
      'ORGANIC': ['organic', 'compost', 'food waste'],
      'TREE_PLANTING': [],
      'COMMUNITY_EVENT': [],
      'DIGITAL_DETOX': []
    };

    const targetNames = codeToNameMap[code] || [code.toLowerCase()];
    
    return subcategories.find(sub => {
      const subName = sub.name.toLowerCase();
      return targetNames.some(target => subName.includes(target));
    });
  }
}

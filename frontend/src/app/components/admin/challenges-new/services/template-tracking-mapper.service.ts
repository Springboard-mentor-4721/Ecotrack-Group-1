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
      const matches = this.findSubcategoriesForCode(sourceCode, allSubcategories);
      if (matches && matches.length > 0) {
        matches.forEach(match => {
          if (!resolvedIds.includes(match.id)) {
            resolvedIds.push(match.id);
          }
        });
      } else {
        console.warn(`TemplateTrackingMapper: Could not resolve tracking source '${sourceCode}' to a valid CarbonSubCategory ID.`);
      }
    });

    return resolvedIds;
  }

  private findSubcategoriesForCode(code: TrackingSourceCode, subcategories: CarbonSubcategory[]): CarbonSubcategory[] {
    // Basic mapping dictionary for known codes to common names
    const codeToNameMap: Record<string, string[]> = {
      'CYCLE': ['cycle', 'bicycle'],
      'BIKE': ['bike', 'motorbike', 'motorcycle'],
      'CAR': ['car', 'taxi', 'electric car', 'ev'],
      'TRAIN': ['train', 'rail'],
      'METRO': ['metro', 'subway'],
      'RECYCLED': ['recycled', 'recycling'],
    };

    const targetNames = codeToNameMap[code as string] || [code.toLowerCase().replace(/_/g, ' ')];
    
    return subcategories.filter(sub => {
      const subName = sub.name.toLowerCase();
      return targetNames.some(target => new RegExp(`\\b${target}\\b`, 'i').test(subName));
    });
  }
}

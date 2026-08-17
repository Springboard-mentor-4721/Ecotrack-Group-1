import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Badge } from '../../../models/gamification.models';

@Component({
  selector: 'app-badge-emblem',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-emblem.component.html',
  styleUrls: ['./badge-emblem.component.css']
})
export class BadgeEmblemComponent implements OnInit, OnChanges {
  @Input() badge!: Badge;
  @Input() size: number = 80;
  @Input() showStatusOverlay: boolean = false; // To show the small lock icon if locked
  @Input() forceUnlocked: boolean = false; // To force full color (e.g. for Admin panel)

  // Derived properties
  public iconClass: string = 'bi-star-fill';
  public artworkUrl: string | null = null;
  public rarityColor: string = '#cbd5e1'; // Default
  public rarityGradientStart: string = '#f8fafc';
  public rarityGradientEnd: string = '#e2e8f0';
  public iconColor: string = '#475569';

  ngOnInit() {
    this.setupBadgeVisuals();
  }

  ngOnChanges() {
    this.setupBadgeVisuals();
  }

  private setupBadgeVisuals() {
    if (!this.badge) return;

    // Rarity Colors
    const rarity = (this.badge.rarity || 'COMMON').toUpperCase();
    switch (rarity) {
      case 'COMMON':
        this.rarityColor = '#94a3b8'; // Slate
        this.rarityGradientStart = '#f1f5f9';
        this.rarityGradientEnd = '#cbd5e1';
        this.iconColor = '#64748b';
        break;
      case 'RARE':
        this.rarityColor = '#3b82f6'; // Blue
        this.rarityGradientStart = '#eff6ff';
        this.rarityGradientEnd = '#bfdbfe';
        this.iconColor = '#2563eb';
        break;
      case 'EPIC':
        this.rarityColor = '#a855f7'; // Purple
        this.rarityGradientStart = '#faf5ff';
        this.rarityGradientEnd = '#e9d5ff';
        this.iconColor = '#9333ea';
        break;
      case 'LEGENDARY':
        this.rarityColor = '#eab308'; // Gold
        this.rarityGradientStart = '#fefce8';
        this.rarityGradientEnd = '#fef08a';
        this.iconColor = '#ca8a04';
        break;
    }

    const BADGE_ARTWORK_MAP: Record<string, string> = {
      'first logger': 'assets/badges/First Logger.png',
      'goal getter': 'assets/badges/Goal Getter.png',
      'consistent logger': 'assets/badges/Consistent Logger.png',
      'dedicated tracker': 'assets/badges/Dedicated Tracker.png',
      'goal master': 'assets/badges/Goal Master.png',
      'watt saver': 'assets/badges/Watt Saver.png',
      'earth plate': 'assets/badges/Earth Plate.png',
      'second-life hero': 'assets/badges/Second-Life Hero.png',
      'cycling': 'assets/badges/Cycling Champion.png',
      'bike': 'assets/badges/Cycling Champion.png',
      'tree': 'assets/badges/Tree Guardian.png',
      'forest': 'assets/badges/Tree Guardian.png',
      'water': 'assets/badges/Water Saver.png',
      'liquid': 'assets/badges/Water Saver.png',
      'ocean': 'assets/badges/Water Saver.png',
      'solar': 'assets/badges/Solar Champion.png',
      'waste': 'assets/badges/Waste Warrior.png',
      'recycle': 'assets/badges/Waste Warrior.png',
      'plastic': 'assets/badges/Plastic-Free Hero.png',
      'plant': 'assets/badges/Plant Powered.png',
      'transit': 'assets/badges/Transit Pioneer.png',
      'bus': 'assets/badges/Transit Pioneer.png',
      'earth': 'assets/badges/Earth Protector.png',
      'world': 'assets/badges/Earth Protector.png',
      'shopper': 'assets/badges/Conscious Shopper.png',
      'bag': 'assets/badges/Conscious Shopper.png',
      'energy': 'assets/badges/Clean Energy Hero.png',
      'watt': 'assets/badges/Clean Energy Hero.png',
      'dreamer': 'assets/badges/Green Dreamer.png',
      'carbon crusher': 'assets/badges/Carbon Crusher.png',
      'car-free champion': 'assets/badges/Car-Free Champion.png',
      'digital eco hero': 'assets/badges/Digital Eco Hero.png',
      'eco commuter': 'assets/badges/Eco Commuter.png',
      'walking warrior': 'assets/badges/Walking Warrior.png',
      'green lifestyle champion': 'assets/badges/Green Lifestyle Champion.png',
      'beach guardian': 'assets/badges/Beach Guardian.png'
    };

    const ICON_TO_ARTWORK_MAP: Record<string, string> = {
      'bicycle': 'assets/badges/Cycling Champion.png',
      'bike': 'assets/badges/Cycling Champion.png',
      'tree': 'assets/badges/Tree Guardian.png',
      'treepine': 'assets/badges/Tree Guardian.png',
      'droplet': 'assets/badges/Water Saver.png',
      'droplets': 'assets/badges/Water Saver.png',
      'sun': 'assets/badges/Solar Champion.png',
      'recycle': 'assets/badges/Waste Warrior.png',
      'trash2': 'assets/badges/Plastic-Free Hero.png',
      'flower1': 'assets/badges/Plant Powered.png',
      'leaf': 'assets/badges/Plant Powered.png',
      'bus-front': 'assets/badges/Transit Pioneer.png',
      'bus': 'assets/badges/Transit Pioneer.png',
      'globe-americas': 'assets/badges/Earth Protector.png',
      'utensils': 'assets/badges/Earth Protector.png',
      'bag-heart': 'assets/badges/Conscious Shopper.png',
      'shoppingbag': 'assets/badges/Conscious Shopper.png',
      'lightning-charge': 'assets/badges/Clean Energy Hero.png',
      'zap': 'assets/badges/Clean Energy Hero.png',
      'hearthandshake': 'assets/badges/Second-Life Hero.png'
    };

    const name = this.badge.name.toLowerCase();
    let nameMappedArtwork: string | null = null;
    
    for (const [key, value] of Object.entries(BADGE_ARTWORK_MAP)) {
      if (name.includes(key)) {
        nameMappedArtwork = value;
        break;
      }
    }

    let finalArtworkUrl: string | null = null;
    let finalIconClass: string | null = null;

    if (this.badge.type === 'CHALLENGE') {
      if (this.badge.icon) {
        const iconVal = this.badge.icon.toLowerCase();
        
        // 1. Explicit custom artwork reference
        if (iconVal.includes('.svg') || iconVal.includes('/')) {
          finalArtworkUrl = iconVal;
        } 
        // 2. Exact badge artwork mapping (preferred if it matches the badge name)
        else if (nameMappedArtwork) {
          finalArtworkUrl = nameMappedArtwork;
        }
        // 3. Known artwork mapping
        else if (ICON_TO_ARTWORK_MAP[iconVal]) {
          finalArtworkUrl = ICON_TO_ARTWORK_MAP[iconVal];
        } 
        // 4. Existing backend icon
        else {
          finalIconClass = 'bi-' + iconVal;
          if (!finalIconClass.includes('fill') && !finalIconClass.includes('recycle')) {
            finalIconClass += '-fill';
          }
        }
      } else {
        finalArtworkUrl = nameMappedArtwork;
      }
      
      // Override colors based on badge.color
      if (this.badge.color) {
        const customColor = this.getCustomColorValue(this.badge.color);
        if (customColor) {
          this.rarityColor = customColor.main;
          this.rarityGradientStart = customColor.start;
          this.rarityGradientEnd = customColor.end;
          this.iconColor = customColor.icon;
        }
      }
    } else {
      // General achievements
      finalArtworkUrl = nameMappedArtwork;
    }

    // 4. Professional generic sustainability fallback
    if (!finalArtworkUrl && !finalIconClass) {
      finalArtworkUrl = 'assets/badges/generic-fallback.svg';
    }

    this.artworkUrl = finalArtworkUrl;
    this.iconClass = finalIconClass || 'bi-award-fill'; // 5. safe fallback
  }

  private getCustomColorValue(colorName: string): {main: string, start: string, end: string, icon: string} | null {
    switch(colorName.toLowerCase()) {
      case 'emerald':
      case 'green':
        return { main: '#10b981', start: '#ecfdf5', end: '#a7f3d0', icon: '#059669' };
      case 'blue':
      case 'sky':
        return { main: '#3b82f6', start: '#eff6ff', end: '#bfdbfe', icon: '#2563eb' };
      case 'purple':
        return { main: '#a855f7', start: '#faf5ff', end: '#e9d5ff', icon: '#9333ea' };
      case 'yellow':
      case 'amber':
        return { main: '#f59e0b', start: '#fffbeb', end: '#fde68a', icon: '#d97706' };
      case 'red':
      case 'rose':
        return { main: '#ef4444', start: '#fef2f2', end: '#fecaca', icon: '#dc2626' };
      case 'orange':
        return { main: '#f97316', start: '#fff7ed', end: '#fed7aa', icon: '#ea580c' };
      case 'cyan':
        return { main: '#06b6d4', start: '#ecfeff', end: '#a5f3fc', icon: '#0891b2' };
      default:
        return null;
    }
  }
}

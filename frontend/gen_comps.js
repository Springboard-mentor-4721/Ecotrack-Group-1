const fs = require('fs');
const path = require('path');

const components = [
  'achievements/achievements-page',
  'leaderboard/leaderboard-page',
  'challenges/challenge-list-page',
  'challenges/my-challenges-page',
  'challenges/challenge-detail-page',
  'recommendations/recommendation-page',
  'notifications/notification-list-page',
  'admin/challenges/admin-challenge-list',
  'admin/badges/admin-badge-list',
  'admin/config/admin-config-page',
  'navbar/notification-bell'
];

for (const comp of components) {
  const compPath = path.join(__dirname, 'src/app/components', comp);
  const dirName = path.dirname(compPath);
  const baseName = path.basename(compPath);
  
  if (!fs.existsSync(compPath)) {
    fs.mkdirSync(compPath, { recursive: true });
  }

  // Component class name (e.g. achievements-page -> AchievementsPageComponent)
  const className = baseName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Component';

  const tsContent = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-${baseName}',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './${baseName}.component.html',
  styleUrls: ['./${baseName}.component.css']
})
export class ${className} {
}
`;

  const htmlContent = `<p>${baseName} works!</p>\n`;
  const cssContent = `/* ${baseName} styles */\n`;

  fs.writeFileSync(path.join(compPath, `${baseName}.component.ts`), tsContent);
  fs.writeFileSync(path.join(compPath, `${baseName}.component.html`), htmlContent);
  fs.writeFileSync(path.join(compPath, `${baseName}.component.css`), cssContent);
  
  console.log(`Generated ${className} at ${compPath}`);
}
console.log('All components generated successfully.');

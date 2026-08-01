import os

styles_path = 'frontend/src/styles.css'
with open(styles_path, 'r', encoding='utf-8') as f:
    content = f.read()

import_stmt = "@import './app/components/admin/challenges/styles/design-system.css';"
if import_stmt not in content:
    content = import_stmt + '\n' + content
    with open(styles_path, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = 'frontend/src/app/components/admin/challenges'

def clean_file(filepath):
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        with open(filepath, 'w', encoding='utf-8') as f:
            for line in lines:
                if '@import' in line and 'design-system.css' in line:
                    continue
                f.write(line)

clean_file(os.path.join(base_dir, 'pages', 'challenge-create', 'challenge-create.css'))
clean_file(os.path.join(base_dir, 'pages', 'challenge-dashboard', 'challenge-dashboard.css'))
clean_file(os.path.join(base_dir, 'components', 'challenge-config', 'challenge-config.css'))
clean_file(os.path.join(base_dir, 'components', 'rule-builder', 'rule-builder.css'))
clean_file(os.path.join(base_dir, 'components', 'campaign-preview', 'campaign-preview.css'))
clean_file(os.path.join(base_dir, 'components', 'template-gallery', 'template-gallery.css'))
clean_file(os.path.join(base_dir, 'components', 'challenge-card', 'challenge-card.css'))
clean_file(os.path.join(base_dir, 'components', 'chip-selector', 'chip-selector.css'))
clean_file(os.path.join(base_dir, 'components', 'tracking-badge', 'tracking-badge.css'))

print('CSS files cleaned successfully.')

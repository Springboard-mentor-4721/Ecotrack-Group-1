import os
import re

path = 'frontend/src/app/components/admin/challenges/pages/challenge-dashboard/challenge-dashboard.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace size="14" or size="20" with empty string
content = re.sub(r' size="[0-9]+"', '', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Removed size attributes')

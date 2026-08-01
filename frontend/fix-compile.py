import os

path = 'frontend/src/app/components/admin/challenges/pages/challenge-dashboard/challenge-dashboard.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { ChallengeCard } from '../../components/challenge-card/challenge-card';\n", "")
content = content.replace("ChallengeCard, ", "")
content = content.replace("'SCHEDULED'", "'PENDING'")
content = content.replace("'DRAFT'", "'CLOSED'")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

path_html = 'frontend/src/app/components/admin/challenges/pages/challenge-dashboard/challenge-dashboard.html'
with open(path_html, 'r', encoding='utf-8') as f:
    content_html = f.read()

content_html = content_html.replace("c.participantCount", "$any(c).participantCount")

with open(path_html, 'w', encoding='utf-8') as f:
    f.write(content_html)

print('Fixed ts and html')

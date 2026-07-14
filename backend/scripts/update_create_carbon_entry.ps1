$content = @'
$kind: http-request
url: ''{{baseUrl}}/api/carbon''
method: POST
headers:
  - key: Content-Type
    value: application/json
  - key: Authorization
    value: ''Bearer {{jwtToken}}''
body:
  type: text
  content: |-
    {
        "categoryId": 1,
        "unit": "km",
        "quantity": 25.5,
        "entryDate": "2026-07-14",
        "notes": "Morning commute"
    }
order: 1000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test(''Status code is success'', function () {
        pm.expect(pm.response.code).to.be.oneOf([200, 201]);
      });

      pm.test(''Response time is under 2000ms'', function () {
        pm.expect(pm.response.responseTime).to.be.below(2000);
      });

      const contentType = pm.response.headers.get(''Content-Type'') || '''';
      let json = null;

      if (pm.response.text() && contentType.toLowerCase().includes(''application/json'')) {
        pm.test(''Response content type is JSON'', function () {
          pm.expect(contentType.toLowerCase()).to.include(''application/json'');
        });

        pm.test(''Response body is valid JSON'', function () {
          json = pm.response.json();
          pm.expect(json).to.exist;
        });
      }

      if (json) {
        const payload = JSON.parse(pm.request.body.toString());
        const entity = json.data || json.entry || json.carbonEntry || json;

        pm.test(''Response includes created resource details'', function () {
          pm.expect(entity).to.be.an(''object'');
        });

        if (entity.id !== undefined) {
          pm.test(''Created resource has an id'', function () {
            pm.expect(entity.id).to.exist;
          });
        }

        if (entity.categoryId !== undefined) {
          pm.test(''categoryId matches request payload'', function () {
            pm.expect(entity.categoryId).to.eql(payload.categoryId);
          });
        }

        if (entity.unit !== undefined) {
          pm.test(''unit matches request payload'', function () {
            pm.expect(entity.unit).to.eql(payload.unit);
          });
        }

        if (entity.quantity !== undefined) {
          pm.test(''quantity matches request payload'', function () {
            pm.expect(entity.quantity).to.eql(payload.quantity);
          });
        }

        if (entity.entryDate !== undefined) {
          pm.test(''entryDate matches request payload'', function () {
            pm.expect(entity.entryDate).to.eql(payload.entryDate);
          });
        }

        if (entity.notes !== undefined) {
          pm.test(''notes matches request payload'', function () {
            pm.expect(entity.notes).to.eql(payload.notes);
          });
        }
      }
'@
Set-Content -LiteralPath 'postman/collections/EcoTrack API Suite/Carbon Tracking/Create Carbon Entry.request.yaml' -Value $content

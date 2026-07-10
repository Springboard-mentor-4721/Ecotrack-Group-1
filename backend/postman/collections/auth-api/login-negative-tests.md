Use the existing login request with these payload variations to validate negative scenarios:

1. Invalid credentials
{
  "email": "wrong@example.com",
  "password": "wrongpassword"
}
Expected: 401 and message containing "invalid"

2. Missing email
{
  "email": "",
  "password": "password123"
}
Expected: 400

3. Missing password
{
  "email": "user@example.com",
  "password": ""
}
Expected: 400

4. Suspended account
{
  "email": "suspended@example.com",
  "password": "password123"
}
Expected: 403 and message containing "suspended"

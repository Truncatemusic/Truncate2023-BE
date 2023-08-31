# API: `/user`

---
## register a new user

### Request `POST /user/register`

#### Body
```json
{
  "email": "<email address>",
  "username": "<username>",
  "password": "<password>",
  "firstname": "<first name>",
  "lastname": "<last name>"
}
```

### Responses

#### email address is already taken
```json
{
  "success": false,
  "reason": "EMAIL_ALREADY_TAKEN"
}
```

#### username is already taken
```json
{
  "success": false,
  "reason": "USERNAME_ALREADY_TAKEN"
}
```

#### unknown error
```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

#### successfully registered
```json
{
  "success": true
}
```

---
## get user information

### Request `GET /user/info`

`session` _cookie required_

### Response

```json
{
  "success": true,
  "email": "<email address>",
  "username": "<username>",
  "password": "<password>",
  "firstname": "<first name>",
  "lastname": "<last name>"
}
```

---
## get users projects

### Request `GET /user/projects`

`session` _cookie required_

### Response

```json
[
  {
    "id": "<project id>",
    "name": "<project name>",
    "lastVersion": {
      "versionNumber": <version number>,
      "timestamp": "<version-created timestamp>",
      "songBPM": <song bpm | null>,
      "songKey": "<song key | null>"
    }
  }
]
```
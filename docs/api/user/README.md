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
## update users public status

### Request `PATCH /user/public`

#### Body
```json
{
  "public": "<public status as boolean>"
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
  "lastname": "<last name>",
  "blocked": "<is user blocked>",
  "public": "<is user public>"
}
```

---
## search users

### Request `GET /user/search?query=<search_query>`

`session` _cookie required_

### Response

```json
[
  {
    "id": "<user id>",
    "username": "<username>",
    "firstname": "<first name>",
    "lastname": "<last name>"
  }
]
```
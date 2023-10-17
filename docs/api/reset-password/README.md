# API: `/reset-password`

---
## request password reset

### Request `POST /reset-password`

#### Body
```json
{
  "email": "<email address of user to reset password>"
}
```

### Responses

#### user with email address does not exist
```json
{
  "success": false,
  "reason": "USER_DOES_NOT_EXIST"
}
```

#### unknown error
```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

#### successfully requested password reset
```json
{
  "success": true
}
```

### Request `PATCH /reset-password`

#### Body
```json
{
  "key": "<reset key>",
  "password": "<new password>"
}
```

### Responses

#### invalid key
```json
{
  "success": false,
  "reason": "INVALID_KEY"
}
```

#### unknown error
```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

#### successful password reset
```json
{
  "success": true
}
```
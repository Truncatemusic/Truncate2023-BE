# API: `/auth`

---

## login user

### Request `POST /auth/login`

#### Body

```json
{
    "login": "<email or username>",
    "password": "<password>"
}
```

### Responses

#### user does not exist

```json
{
  "success": false,
  "reason": "USER_DOES_NOT_EXIST"
}
```

#### wrong password

```json
{
  "success": false,
  "reason": "PASSWORD_INCORRECT"
}
```

#### successfully logged in

```json
{
  "success": true,
  "session": "<session key>"
}
```

---

## logout user

### Request `POST /auth/logout`

`session` _cookie required_

### Responses

#### unknown error

```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

### successfully logged out

```json
{
  "success": true
}
```

---

## update session start time

### Request `PATCH /auth/updateSession`

`session` _cookie required_

### Responses

#### unknown error

```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

#### successfully updated session

```json
{
  "success": true
}
```

---

## validate session

### Request `GET /auth/validateSession`

`session` _cookie required_

### Responses

#### session is valid

```json
{
  "success": true
}
```
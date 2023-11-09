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

`session` _cookie required_

#### Body
```json
{
  "public": "<public status as boolean>"
}
```

---
## get own user information

### Request `GET /user/info`

`session` _cookie required_

### Response

```json
{
  "success": true,
  "isSelf": true,
  "id": "<user id>",
  "email": "<email address>",
  "username": "<username>",
  "firstname": "<first name>",
  "lastname": "<last name>",
  "blocked": "<is user blocked>",
  "public": "<is user public>"
}
```

---
## get others user information

### Request `GET /user/info?id=<user_id>`

`session` _cookie required_

### Responses

#### user not visible
```json
{
  "success": false,
  "reason": "USER_NOT_VISIBLE"
}
```

#### get user data
```json
{
  "success": true,
  "isSelf": false,
  "id": "<user id>",
  "email": "<email address>",
  "username": "<username>",
  "firstname": "<first name>",
  "lastname": "<last name>",
  "blocked": "<is user blocked>",
  "public": "<is user public>",
  "isFollowing": "<am i following this user>"
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

---
## follow a user

### Request `POST /user/follow`

`session` _cookie required_

#### Body

```json
{
  "followUserId": "<user id to follow>"
}
```

### Responses

#### already following
```json
{
  "success": true,
  "reason": "ALREADY_FOLLOWING"
}
```

#### user is not public
```json
{
  "success": false,
  "reason": "USER_NOT_PUBLIC"
}
```

#### followed successfully
```json
{
  "success": true
}
```

---
## unfollow a user

### Request `POST /user/unfollow`

`session` _cookie required_

#### Body

```json
{
  "unfollowUserId": "<user id to unfollow>"
}
```

### Responses

#### already unfollowed
```json
{
  "success": true,
  "reason": "ALREADY_UNFOLLOWED"
}
```

#### unfollowed successfully
```json
{
  "success": true
}
```
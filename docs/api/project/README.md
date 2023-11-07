# API: `/project`

## sub APIs

- [`/project/version`](version)
- [`/project/checklist`](checklist)

---
## get users projects

### Request `GET /project/all`

`session` _cookie required_

### Response

```json
[
  {
    "id": "<project id>",
    "name": "<project name>",
    "lastVersion": {
      "versionNumber": "<version number>",
      "timestamp": "<version-created timestamp>",
      "songBPM": "<song bpm | null>",
      "songKey": "<song key | null>",
      "files": [
        {
          "id": "<128-byte file id>",
          "type": "<file type - like wav, mp3,...>"
        }
      ]
    }
  }
]
```

---
## create a new project

### Request `POST /project/create`

#### Body

`session` _cookie required_

```json
{
  "project_id": "<id of the new project>",
  "versionNumber": "<version number of the new project>",
  "name": "<name of the new project>",
  "songBPM": "<bpm | null>",
  "songKey": "<key | null>"
}
```

### Responses

#### invalid project name

```json
{
  "success": false,
  "reason": "INVALID_PROJECT_NAME"
}
```

#### unknown error

```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

#### successfully created project

```json
{
  "success": true,
  "project_id": "<id of the new created project>",
  "versionNumber": "<init version number of the new project>"
}
```

---
## get project information

### Request `GET /project/info?id=<project_id>`

`session` _cookie required_

### Responses

#### unknown error

```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

#### project info

```json
{
  "success": true,
  "name": "<project name>",
  "versions": [
    {
      "versionNumber": "<version number>",
      "timestamp": "<version-created timestamp>",
      "songBPM": "<song bpm | null>",
      "songKey": "<song key | null>"
    }
  ]
}
```

---
## delete a project

### Request `POST /project/delete`

#### Body

`session` _cookie required_

```json
{
    "id": "<id of the project>"
}
```

### Responses

#### unknown error

```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

#### successfully deleted project

```json
{
  "success": true
}
```

---
## rename a project

### Request `PATCH /project/rename`

#### Body

`session` _cookie required_

```json
{
  "id": "<id of the project>",
  "name": "<new project name>"
}
```

### Responses

#### unknown error

```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

#### successfully renamed project

```json
{
  "success": true
}
```

---
## add user to a project / update user role

### Request `POST /project/user/add`

#### Body

`session` _cookie required_

```json
{
  "id": "<id of the project>",
  "user_id": "<id if the user to add>",
  "role": "<O = Owner | A = Admin | S = Spectator>"
}
```

### Responses

#### invalid role

```json
{
  "success": false,
  "reason": "INVALID_ROLE"
}
```

#### unknown error

```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

#### successfully added user

```json
{
  "success": true,
  "action": "ADDED"
}
```

#### successfully updated user role

```json
{
  "success": true,
  "action": "UPDATED"
}
```

---
## remove user from a project

### Request `POST /project/user/remove`

#### Body

`session` _cookie required_

```json
{
  "id": "<id of the project>",
  "user_id": "<id if the user to add>"
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

#### successfully removed user

```json
{
  "success": true
}
```

---
## get project users

### Request `GET /project/users?id=<project_id>`

`session` _cookie required_

### Responses

#### project users

```json
{
  "success": true,
  "users": [
    {
      "id": "<project-user id>",
      "role": "<project-user role>",
      "user": {
        "isSelf": "<is this user the one who made the request?>",
        "id": "<user id>",
        "email": "<user email>",
        "username": "<user username>",
        "firstname": "<user firstname>",
        "lastname": "<user lastname>"
      }
    }
  ]
}
```
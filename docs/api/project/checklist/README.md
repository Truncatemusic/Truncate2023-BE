# API: `/project/checklist`

---
## create a new project checklist entry

### Request `POST /project/checklist/entry/add`

#### Body

`session` _cookie required_

```json
{
  "projectId": "<id of the project to add new checklist entry>",
  "versionNumber": "<version number of the project to add new checklist entry>",
  "text": "<checklist entry text>"
}
```

### Responses

#### invalid project or version

```json
{
  "success": false,
  "reason": "INVALID_PROJECT_OR_VERSION"
}
```

#### unknown error

```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

#### successfully added new project checklist entry

```json
{
  "success": true,
  "id": "<project entry id>"
}
```

---
## get all project checklist entries

### Request `GET /project/checklist/entries?projectId=<project_id>&versionNumber=<version_number>`

`session` _cookie required_

### Responses

#### invalid project or version

```json
{
  "success": false,
  "reason": "INVALID_PROJECT_OR_VERSION"
}
```

#### entries

```json
{
  "success": true,
  "entries": [
    {
      "id": "<entry id>",
      "user_id": "<author user id>",
      "timestamp": "<entry created timestamp>",
      "text": "<entry text>",
      "checkedVersionNumber": "<versionNumber the entry got checked | null if not checked>"
    }
  ]
}
```

---
## check project checklist entry

### Request `PATCH /project/checklist/entry/check`

#### Body

`session` _cookie required_

```json
{
  "projectId": "<project id>",
  "versionNumber": "<project version number>",
  "entryId": "<id of the entry to check>"
}
```

### Responses

#### invalid project or version

```json
{
  "success": false,
  "reason": "INVALID_PROJECT_OR_VERSION"
}
```

#### unknown error

```json
{
  "success": false,
  "reason": "UNKNOWN"
}
```

#### successfully checked entry

```json
{
  "success": true
}
```
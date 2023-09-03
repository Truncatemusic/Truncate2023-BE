# API: `/project/checklist`

---
## create a new project checklist entry

### Request `POST /project/checklist/entry/add`

#### Body

`session` _cookie required_

```json
{
  "projectId": "<id of the project to add new checklist entry>",
  "text": "<checklist entry text>"
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

#### invalid project id

```json
{
  "success": false,
  "reason": "INVALID_PROJECT"
}
```

#### successfully added new project checklist entry

```json
{
  "success": true,
  "id": <project entry id>
}
```

---
## get all project checklist entries

### Request `GET /project/checklist/entries`

#### Body

`session` _cookie required_

```json
{
  "projectId": "<id of the project to get the checklist entries from>"
}
```

### Responses

#### entries

```json
[
  {
    "id": <entry id>,
    "user_id": <author user id>,
    "timestamp": "<entry created timestamp>",
    "text": "<entry text>",
    "checkedVersionNumber": <versionNumber the entry got checked | null if not checked>
  }
]
```
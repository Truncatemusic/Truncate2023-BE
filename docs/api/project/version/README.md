# API: `/project/version`

---
## create a new project version

### Request `POST /project/version/create`

#### Body

`session` _cookie required_

```json
{
    "projectId": "<id of the project to add new version>"
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

#### successfully added new project version

```json
{
  "success": true,
  "version": <version number of the new version>
}
```

---
## get in version stored files

### Request `GET /project/version/files`

#### Body

`session` _cookie required_

```json
{
  "projectId": "<id of the project>",
  "versionNumber": "<version number>"
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

#### files

```json
[
  {
    "id": "<128-byte file id>",
    "type": "<file type - like wav, mp3,...>"
  }
]
```
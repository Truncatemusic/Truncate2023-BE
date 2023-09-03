# API: `/project/version`

## sub APIs

- [`/project/version/file`](file)

---
## create a new project version

### Request `POST /project/version/create`

#### Body

`session` _cookie required_

```json
{
  "projectId": "<id of the project to add new version>",
  "songBPM": "<bpm | null>",
  "songKey": "<key | null>"
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
  "version": "<version number of the new version>"
}
```

---
## get the last project version

### Request `GET /project/version/last`

#### Body

`session` _cookie required_

```json
{
    "projectId": "<id of the project>"
}
```

### Responses

#### invalid project id

```json
{
  "success": false,
  "reason": "INVALID_PROJECT"
}
```

#### last project version

```json
{
  "success": true,
  "versionNumber": "<version number>",
  "timestamp": "<version-created timestamp>",
  "songBPM": "<song bpm | null>",
  "songKey": "<song key | null>"
}
```

---
## get files stored in version

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

---
## set version info (songBPM, songKey, ...)

### Request `PATCH /project/version/info`

#### Body

`session` _cookie required_

```json
{
  "projectId": "<id of the project>",
  "versionNumber": "<version number>",
  "songBPM": "<new song BPM | null>",
  "songKey": "<new song Key | null>"
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

#### successfully updated info

```json
{
  "success": true,
  "updatedSongBPM": "<true|false>",
  "updatedSongKey": "<true|false>"
}
```
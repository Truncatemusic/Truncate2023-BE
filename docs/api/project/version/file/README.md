# API: `/project/version/file`

---
## get waveform data

### Request `GET /project/version/file/waveformData/<32-byte-id>`

#### Body

`session` _cookie required_

### Responses

_empty or file stream_

---
## get audio

### Request `GET /project/version/file/audio/<type-like-wav...>/<32-byte-id>`

#### Body

`session` _cookie required_

### Responses

_empty or audio file stream_

---
## get audio url

### Request `GET /project/version/file/audio/url/<type-like-wav...>/<32-byte-id>`

#### Body

`session` _cookie required_

### Responses

#### resource not found

```json
{
  "success": false,
  "reason": "RESOURCE_NOT_FOUND"
}
```

#### success

```json
{
  "success": true,
  "url": "<url to the audio resource>"
}
```

---
## upload audio file

### Request `POST /project/version/file/audio/upload/<project-id>/<version-number>`

#### Body

`form-data` content type

`session` _cookie required_

### Responses

#### invalid project or version

```json
{
  "success": false,
  "reason": "INVALID_PROJECT_OR_VERSION"
}
```

#### invalid file type

```json
{
  "success": false,
  "reason": "INVALID_FILE_TYPE"
}
```

#### file uploaded and added successfully

```json
{
  "success": true,
  "id": "<128-byte file id>"
}
```
# API: `/project/version/file`

---
## get waveform image

### Request `GET /project/version/file/waveformImage/<32-byte-id>`

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
## upload audio file

### Request `POST /audio/upload/<project-id>/<version-number>`

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

#### file uploaded and added successfully

```json
{
  "success": true,
  "id": "<128-byte file id>"
}
```
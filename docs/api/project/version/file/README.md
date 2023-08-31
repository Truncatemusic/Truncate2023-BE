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
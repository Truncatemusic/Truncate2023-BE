# API: `/project`

## sub APIs

- [`/project/version`](version)

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
  "songBPM": <bpm | null>,
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
  "project_id": <id of the new created project>
}
```

---
## get project information

### Request `GET /project/info`

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

#### project info

```json
{
  "success": true,
  "name": "<project name>"
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
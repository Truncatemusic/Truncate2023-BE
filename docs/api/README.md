# API Docs

## APIs

- [`/auth`](auth)
- [`/user`](user)
- [`/project`](project)

## Default Responses

### invalid session

this response is always returned if the session cookie is needed but it is not set or matches a session key in the
database.

```json
{
  "success": false,
  "reason": "INVALID_SESSION"
}
```
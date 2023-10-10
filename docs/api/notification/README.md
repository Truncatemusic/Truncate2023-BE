# API: `/notification`

---
## get all notifications

### Request `GET /notification/all?isRead=<readed_notifications>&from=<filter_from>&to=<filter_to>`

#### Params

- `isRead` - only readed or not readed notifications (`1` or `0`; unset to select every notification)
- `from` - only list from this value (not required)
- `to` - only list to this value (not required)

`session` _cookie required_

### Responses

#### user notifications
```json
[
  {
    "id": "<notification id>",
    "user_id": "<user id>",
    "notificationTemplateId": "<frontend notification template id>",
    "timestamp": "<notification timestemp>",
    "isRead": "<was the notification read>",
    "params": [
      {
        "key": "<notification param key>",
        "value": "<notification param value>"
      }
    ]
  }
]
```

---
## get the count of all unread notifications

### Request `GET /notification/countOfUnread`

#### Params

`session` _cookie required_

### Responses

#### count

```json
{
  "success": true,
  "count": "<count>"
}
```


---
## set notification to read status

### Request `POST /notification/read`

`session` _cookie required_

# Body

```json
{
  "notificationId": "<notification id>"
}
```

### Responses

_empty_

### Responses

_empty_

---
## set all notifications to read status

### Request `POST /notification/readAll`

`session` _cookie required_

### Responses

_empty_

---
## set notification to unread status

### Request `POST /notification/unread`

`session` _cookie required_

# Body

```json
{
  "notificationId": "<notification id>"
}
```

### Responses

_empty_

---
## set all notifications to unread status

### Request `POST /notification/unreadAll`

`session` _cookie required_

### Responses

_empty_

---
## delete notification

### Request `POST /notification/delete`

`session` _cookie required_

# Body

```json
{
  "notificationId": "<notification id>"
}
```

### Responses

_empty_

---
## delete all notifications

### Request `POST /notification/deleteAll`

`session` _cookie required_

### Responses

_empty_
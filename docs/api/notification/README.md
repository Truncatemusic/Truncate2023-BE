# API: `/notification`

---
## get all notifications

### Request `GET /notification/all`

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
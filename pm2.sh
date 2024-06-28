#!/bin/bash

if [ $# -ne 2 ]; then
  echo "Usage: $0 <start|stop> <pm2_service_name>"
  exit 1
fi

ACTION=$1
SERVICE_NAME=$2

if [ "$ACTION" = "stop" ]; then
  pm2 stop $SERVICE_NAME || true
elif [ "$ACTION" = "start" ]; then
  pm2 describe $SERVICE_NAME > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    pm2 restart $SERVICE_NAME
  else
    pm2 start npm --name $SERVICE_NAME -- start
  fi
else
  echo "Unknown action '$ACTION'. Please use 'start' or 'stop'."
  exit 1
fi
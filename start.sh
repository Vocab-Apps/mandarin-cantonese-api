#!/bin/sh
exec gunicorn -b :8042 --access-logfile - --error-logfile - app:app
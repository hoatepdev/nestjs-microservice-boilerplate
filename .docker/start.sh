#!/bin/bash

docker-compose -f docker-compose-infra.yml down -v --remove-orphans
docker-compose -f docker-compose-infra.yml up -d

echo "Services started successfully!"
echo "MongoDB: mongodb://localhost:27017"
echo "Mongo Express: http://localhost:9820"
echo "PostgreSQL: localhost:9800"
echo "PgAdmin: http://localhost:9810"
echo "Redis: localhost:9830"
echo "Grafana: http://localhost:9600"
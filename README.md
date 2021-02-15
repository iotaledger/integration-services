# e-commerce-audit-log


## MongoDB

### Setup MongoDB

Start the docker container using: `docker-compose up -d`

Verify it is running: `docker ps`

Expected output:

---

CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                      NAMES

1a3553ec3f25   mongo:latest   "docker-entrypoint.s…"   5 minutes ago   Up 4 minutes   0.0.0.0:27017->27017/tcp   api_mongodb_container_1

---  

### Connect to MongoDB

Use client like for instance: MongoDB Compass

Coonection String: `mongodb://root:rootpassword@0.0.0.0:27017`




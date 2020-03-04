FROM mysql:5.7

ENV MYSQL_DATABASE lambdaaws
ENV MYSQL_ROOT_PASSWORD mysecret
ENV MYSQL_USER mysql
ENV MYSQL_PASSWORD mysecret
ENV DATABASE_HOST db


EXPOSE 3307

COPY ./sql-scripts /docker-entrypoint-initdb.d/
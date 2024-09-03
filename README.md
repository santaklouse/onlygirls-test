# onlygirls-test
onlygirls test assignment

## How to deploy

1. clone this repo

```
git clone https://github.com/santaklouse/onlygirls-test.git
```
2. `cd onlygirls-test/`
3. place dump of_users table to `./configs/db-init`
4. rename it to `0-of_users.table.dump.sql`
5. run `docker-compose up -d`
6. open http://localhost:8080/ in browser

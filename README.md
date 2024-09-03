# onlygirls-test
onlygirls test assignment

## How to deploy

1. clone this repo

```
git clone https://github.com/santaklouse/onlygirls-test.git
```
2. `cd onlygirls-test/`
3. rename .env.example to .env for root dir and app dir 
4. place dump of_users table to `./configs/db-init`
5. rename it to `0-of_users.table.dump.sql`
6. run `docker-compose up -d`
7. open http://localhost:8080/ in browser

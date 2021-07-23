---
pageTitle: Seeding database with cy.exec
date: 2021-07-23
---

Recently, I found out that [Cypress](https://cypress.io) has a command that can run arbitrary commands, [`cy.exec`](https://docs.cypress.io/api/commands/exec). I've used this to setup my local database with seed data before tests run.

However, the back end I'm working with doesn't have a **deterministic, predictable** seeder, so the test data is not guaranteed. So, I did some fun stuff with Postgres!

## Dump the current state of the database
The first thing I did was get the database into the state that I want. Then, I used `psql` to dump the data into a `.sql` file:

```shell
psql -f seed.sql -d postgres -h 192.168.64.5 -p 31091 -U postgres -W
```

This script sets up the connection to the database I want, and outputs the contents to `seed.sql`.

## Clean the database
Next, I needed to clean the database. I tried using a `--clean` flag, but that didn't seem to work. So, I wrote a separate `.sql` file (`truncate.sql`) to truncate everything:

```shell
# truncate.sql
TRUNCATE TABLE public.table_name RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.another_table_name RESTART IDENTITY CASCADE;
# more TRUNCATE statements...
```

## Execute `psql` within `cypress`
Now, all that was left was to execute some `psql` from within my `cypress` test. I put the 2 `.sql` files inside `./cypress/data`.

I also stored the connection values from above (database name, host, port user, password) in `./cypress.json` as environment variables.

```json
{
  "baseUrl": "http://0.0.0.0:8080",
  "supportFile": "cypress/support/index.ts",
  "viewportHeight": 768,
  "viewportWidth": 1024,
  "env": {
    "PGDATABASE": "postgres",
    "PGHOST": "192.168.64.5",
    "PGPORT": 31091,
    "PGUSER": "postgres",
    "PGPASSWORD": "postgres"
  }
}
```

Now, I'm ready to use `cy.exec`. Here, I'm executing an arbitrary shell command, combining 2 `psql` commands to truncate, then seed the database.

Note that I'm providing another `env` object; Cypress merges these environment variables in with the system environment variables, so I was able to use the same names that Postgres looks for automatically. I'm retrieving the values from `cypress.json` by using `Cypress.env`.

```js
describe('A test suite description', () => {
    before(() => {
        cy.exec(
            'psql -f ./cypress/data/truncate.sql && psql -f ./cypress/data/seed.sql',
            {
                env: {
                    PGDATABASE: Cypress.env('PGDATABASE'),
                    PGHOST: Cypress.env('PGHOST'),
                    PGPORT: Cypress.env('PGPORT'),
                    PGUSER: Cypress.env('PGUSER'),
                    PGPASSWORD: Cypress.env('PGPASSWORD'),
                },
            }
        )
    })
})
```

Here's the output:

![Screen Shot 2021-07-23 at 11 43 11 AM](https://user-images.githubusercontent.com/368723/126814496-057f7d84-4340-4a14-a28d-307190e5daa2.png)

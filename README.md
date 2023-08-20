# CAW DB Migration

Migrate database of [ChatGPT-Admin-Web](https://github.com/AprilNEA/ChatGPT-Admin-Web/) from v1 to v3 **in 30s**.

## Usage

1. Install [Deno](https://deno.land/manual/getting_started/installation) on your local machine
2. Configure `.env` according to `.env.example`
3. Run `deno task prisma-push`
4. Execute `deno run -A migrate.ts`

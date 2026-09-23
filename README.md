# todo-stack

A pnpm + Turborepo monorepo, built while working through onboarding §2 (Node.js, pnpm and the monorepo).
It will grow into the §13 practice app (NestJS + Prisma + Next.js).

## Structure

```
todo-stack/
├── pnpm-workspace.yaml   declares which folders are workspace members
├── turbo.json            task graph (order) and caching rules
├── package.json          root: repo-wide tools only (turbo, typescript)
├── packages/
│   └── types/            @todo/types — shared type definitions, no runtime logic
└── apps/
    └── api/              @todo/api — imports @todo/types (NestJS goes here in §4)
```

`packages/*` are libraries that apps import. `apps/*` are things you can run.

## Commands

```bash
pnpm install                          # install for every workspace member at once
pnpm build                            # turbo run build (types first, then api)
pnpm check-types                      # tsc --noEmit across all packages
pnpm add <pkg> --filter <app>         # add a dependency to one package only
pnpm --filter @todo/api start         # run one package's script
npx turbo run build --dry             # show the task graph and hashes, run nothing
```

## How the pieces fit

| File | Decides |
|---|---|
| `pnpm-workspace.yaml` | which folders count as workspace members |
| `apps/api/package.json` → `"@todo/types": "workspace:*"` | that this dependency comes from a member, not from npm |
| `turbo.json` → `dependsOn: ["^build"]` | that a package's dependencies are built first |
| `turbo.json` → `outputs: ["dist/**"]` | which files are saved to and restored from the cache |
| `packages/types/package.json` → `"types": "./dist/index.d.ts"` | where consumers read type information from |

Running `pnpm install` symlinks `apps/api/node_modules/@todo/types` → `packages/types`,
so edits to the package are visible immediately, with no reinstall.

## What I learned

<!-- 自分の言葉で書く -->

### pnpm and workspaces

### Turborepo

### Build output (`.js`, `.d.ts`)

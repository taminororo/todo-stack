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

### pnpm and workspaces

- `pnpm-workspace.yaml` is what turns a folder into a monorepo root. `pnpm install` walks up
  to find it, so running the command from any member folder installs for all of them.
- `"workspace:*"` is not a version range. It tells pnpm to look among workspace members
  instead of the npm registry, matching on the `name` field of their `package.json`,
  not on the folder name.
- A workspace dependency is a symlink straight to the sibling folder, while a downloaded
  dependency is a symlink into `node_modules/.pnpm/`. Because the workspace link points at
  live source, editing `packages/types` is visible from `apps/api` with no reinstall.
- Listing a package in `dependencies` is also what grants the right to import it.
  `axios` added only to `apps/api` is invisible from `packages/types`, which fails with
  `Cannot find package 'axios'`. Root dependencies are not importable from apps either —
  the root is for repo-wide tooling such as turbo.
- The same library appearing in several `package.json` files is normal. Each package declares
  what it needs, and pnpm still stores one copy on disk.

### Turborepo

- pnpm collects dependencies; turbo decides the order tasks run in and remembers their results.
  They solve different problems.
- `turbo run build` runs each package's `scripts.build`. Nothing declares that link —
  it is a convention based on matching names, and packages without that script are skipped.
- `dependsOn: ["^build"]` means "build what this package depends on first". Doing it by hand
  in the wrong order fails with `Cannot find module '@todo/types'`, because the dependency's
  `dist/` does not exist yet.
- The cache key is a hash of the inputs — source files, tsconfig, and the hashes of
  dependencies — and it is computed before anything runs. `turbo run build --dry` prints it
  without executing a single task.
- A cache hit is a file lookup: if `.turbo/cache/<hash>.tar.zst` exists, turbo unpacks the
  outputs and replays the logs instead of running the command.
- Without `outputs`, turbo still reports a cache hit but restores no files, leaving a build
  that claims to be done with an empty `dist/`.
- Changing a dependency invalidates its dependents too, because their hash includes it.

### Build output (`.js` and `.d.ts`)

- "Build" is a task name, not a fixed operation. Here it happens to be `tsc`; elsewhere it is
  `vite build`, `nest build`, or `prisma generate`.
- `tsc` reads the config, expands `include`, then follows every import. Type checking
  `apps/api`'s single source file pulls in 195 files, mostly `lib.*.d.ts` and `@types/node`.
- `.js` is emitted by default; `.d.ts` only with `declaration: true`. A package that others
  import needs it; an application at the end of the chain does not.
- A `.d.ts` is a description with no implementation — it is never executed, and only `tsc`
  and the editor read it. Even `toUpperCase()` is typed by one line in `lib.es5.d.ts`.
- `tsc --noEmit` and `tsc` do the same work up to type checking; only the writing step differs.

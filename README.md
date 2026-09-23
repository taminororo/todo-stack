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

- pnpmのworkspace機能を使うと、pnpm installを1回打つだけで全ディレクトリの依存が入る。
  workspace内ならどのディレクトリで実行しても、pnpmが上に遡ってルートを見つけるので結果は同じ。

- By using pnpm's workspace feature, you can install dependencies for all directories by running `pnpm install` just once.
  Since pnpm traverses up to locate the root, the result is the same regardless of which directory within the workspace you run the command from.

### Turborepo

- Turborepoはタスクの実行順序を、package.jsonの依存関係から自動で解決してくれる。中身がtscでもvite buildでもechoでも扱えるので、TypeScript専用の道具ではない。

- Turborepo automatically resolves the task execution order based on `package.json` dependencies. Since it handles commands like `tsc`, `vite build`, or even `echo`, it is not a tool exclusive to TypeScript.

- ハッシュ値は入力（srcのソース、tsconfig、依存パッケージのハッシュ）から、実行前に計算される。dist（出力）を書き換えてもハッシュは変わらない。

- The hash value is calculated from the inputs (source code, tsconfig, and dependency package hashes) prior to execution. Modifying the `dist` (output) does not change the hash.

- outputsは「保存・復元するファイル」の指定。ハッシュが一致するキャッシュがあれば、コンパイルを飛ばしてoutputsに書いたファイルを復元する。書き忘れると、 cache hitと表示されるのにdistが空のままになる。

- `outputs` specifies the files to be saved and restored. If a cache with a matching hash exists, the compilation step is skipped, and the files listed in `outputs` are restored. If you forget to include this, the system will report a "cache hit," but the `dist` directory will remain empty.
// NestJS 12 は ESM でしか配布されていないので、テストも ESM のまま動かす。
// そのため package.json の test は node --experimental-vm-modules 付きで jest を起動する
/** @type {import("jest").Config} */
export default {
  rootDir: "src",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.ts$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
          // NestJS の DI と class-validator はデコレーターのメタデータを読む
          transform: { legacyDecorator: true, decoratorMetadata: true },
          target: "es2023",
        },
        module: { type: "es6" },
      },
    ],
  },
  moduleNameMapper: {
    // NodeNext の import は "./foo.js" と書くので、テスト時は "./foo"（.ts）として探す
    "^(\\.{1,2}/.*)\\.js$": "$1",
    // packages/types をビルドしなくてもテストできるよう、ソースを直接読む
    "^@todo/types$": "<rootDir>/../../../packages/types/src/index.ts",
  },
};

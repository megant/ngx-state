# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **NGX States** - a lightweight Angular state management library that provides simple, boilerplate-free state management using reactive patterns. The library offers four main state types: `State<T>`, `ArrayState<T>`, `KeyValueState<KEY, VALUE>`, and `KeyValuesState<KEY, VALUE>`.

## Build Commands

This is an Angular library project using ng-packagr for building:

- **Build library**: `ng-packagr -p ng-package.json`
- **TypeScript compilation**: Uses standard `tsc` with configurations in `tsconfig.lib.json` and `tsconfig.lib.prod.json`

Note: No test scripts, linting, or other build commands are configured in package.json.

## Architecture

### Core State Classes

The library is built around a hierarchy of state management classes:

- **BaseState** (`src/lib/states/base-state.ts`): Abstract base class providing subscription management with `@ngneat/until-destroy` integration
- **State<T>** (`src/lib/states/state.ts`): Simple reactive state using BehaviorSubject
- **ArrayState<T>** (`src/lib/states/array-state.ts`): Array-specific state with convenience methods like `add()`, `remove()`, `update()`, `getFirstItem()`, `stateOfItem()`
- **KeyValueState** and **KeyValuesState**: Key-value pair states for complex data structures

### Key Patterns

1. **Reactive API**: All states expose `.state` Observable and `.value` synchronous getters
2. **Event Handlers**: Consistent `onChange`, `onSet`, `onFirstChange`, `onFirstSet`, `onFromSecondChange`, `onFromSecondSet` methods
3. **Auto Unsubscribe**: Integration with `@ngneat/until-destroy` via optional `callerComponent` parameter
4. **Change Detection Bypass**: Optional `bypassChangeDetection` parameter for performance optimization

### Dependencies

- **Peer Dependencies**: Angular 20+, RxJS 7.8+, @ngneat/until-destroy 10+
- **Core Dependency**: tslib for TypeScript helpers
- **Node Requirements**: Node.js 18.19.1+

### Library Structure

```
src/
├── lib/
│   ├── states/           # Core state classes
│   ├── helpers/          # Utility functions (type.helper.ts)
│   └── types/           # TypeScript type definitions
└── public-api.ts        # Library exports
```

The library follows Angular library conventions with ng-packagr for packaging and distribution to npm.
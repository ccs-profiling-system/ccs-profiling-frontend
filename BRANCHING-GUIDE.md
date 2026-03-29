# CCS Profiling System — Frontend Branching Strategy

## Overview

This document defines the **Git branching strategy** for the frontend repository of the CCS Profiling System.

The goal is to maintain:

* Clean and organized development
* Stable production code
* Scalable workflow for future team collaboration

This project uses a **Lightweight Git Flow** approach — simple, structured, and production-ready.

---

## Branch Structure

### Core Branches

```text
main
dev
```

#### main

* Always **stable and production-ready**
* Used for:

  * deployment
  * demos
  * final presentations

⚠️ Rules:

* No direct commits
* Only updated via merge from `dev`

---

#### dev

* Main **development branch**
* All features are integrated here first

---

### Working Branches

```text
feature/*
fix/*
refactor/*
```

---

## Branch Types

### feature/*

Used for implementing new features

Examples:

```text
feature/students-module
feature/dashboard-ui
feature/events-management
feature/research-page
```

---

### fix/*

Used for bug fixes

Examples:

```text
fix/student-form-validation
fix/api-error-handling
```

---

### refactor/*

Used for code improvements without changing functionality

Examples:

```text
refactor/component-structure
refactor/api-layer
```

---

## Development Workflow

### 1. Start a Feature

```bash
git checkout dev
git pull origin dev

git checkout -b feature/<feature-name>
```

---

### 2. Work and Commit

Use structured commit messages:

```bash
git add .
git commit -m "feat: implement student list UI"
```

---

### 3. Push Branch

```bash
git push origin feature/<feature-name>
```

---

### 4. Merge into dev

#### Option A: Using Pull Request (Recommended)

* Open PR: `feature/* → dev`
* Review changes
* Merge

#### Option B: Manual Merge

```bash
git checkout dev
git pull origin dev

git merge feature/<feature-name>
git push origin dev
```

---

### 5. Release to main

```bash
git checkout main
git pull origin main

git merge dev
git push origin main
```

---

## Commit Message Convention

Use consistent prefixes:

```text
feat: add student dashboard
fix: resolve API error on login
refactor: clean component structure
style: improve spacing and layout
```

---

## Naming Conventions

* Use **kebab-case**
* Keep names clear and descriptive

Good:

```text
feature/student-profile
feature/event-scheduling
```

Avoid:

```text
feature/test123
feature/newStuff
```

---

## ⚠️ Rules and Best Practices

### Do NOT:

* Commit directly to `main`
* Mix multiple features in one branch
* Use unclear branch names
* Keep branches alive too long

---

### Always:

* Branch from `dev`
* Keep branches focused (1 feature = 1 branch)
* Use clear commit messages
* Pull latest changes before merging

---

## Future Expansion

When the project scales, you may introduce:

```text
staging
```

### Updated Flow:

```text
feature → dev → staging → main
```

---

## Purpose

This strategy ensures:

* Stable production builds
* Clean development workflow
* Easy debugging and rollback
* Professional repository management

---

## Final Note

This frontend is part of a **data-heavy system**.

Maintaining a clean Git history and structured workflow is critical for:

* collaboration
* maintainability
* long-term scalability

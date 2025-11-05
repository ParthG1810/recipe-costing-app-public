# Branch Workflow Guide

## Repository Branch Structure

This repository uses a two-branch workflow to separate development and production code.

---

## Branches

### 🔧 `main` - Development Branch

**Purpose:** Active development, testing, and experimental features

**What it contains:**
- Latest development code
- Work-in-progress features
- Experimental changes
- Debug code and development tools
- Backup files and test files

**When to use:**
- Daily development work
- Testing new features
- Debugging and troubleshooting
- Code reviews and collaboration

**Stability:** May contain bugs or incomplete features

---

### 🚀 `live` - Production Branch

**Purpose:** Stable, production-ready code for deployment

**What it contains:**
- Tested and stable code
- Production-ready features
- Clean, optimized code
- No debug or development artifacts

**When to use:**
- Building production releases
- Creating desktop app installers
- Deploying to production
- Sharing with end users

**Stability:** Fully tested and stable

---

## Workflow

### For Developers

#### Working on New Features

1. **Develop on `main` branch:**
   ```bash
   git checkout main
   git pull origin main
   # Make your changes
   git add .
   git commit -m "Add new feature"
   git push origin main
   ```

2. **Test thoroughly on `main`**

3. **When ready for production, merge to `live`:**
   ```bash
   git checkout live
   git pull origin live
   git merge main
   git push origin live
   ```

#### Hotfix for Production

1. **Create fix on `live` branch:**
   ```bash
   git checkout live
   git pull origin live
   # Make your fix
   git add .
   git commit -m "Fix critical bug"
   git push origin live
   ```

2. **Merge back to `main`:**
   ```bash
   git checkout main
   git merge live
   git push origin main
   ```

---

### For Building Desktop App

**Always build from `live` branch:**

```bash
# Switch to live branch
git checkout live
git pull origin live

# Build the desktop app
npm run electron:build
```

This ensures you're building from stable, production-ready code.

---

## Branch Protection (Recommended)

### For `live` Branch

Consider enabling these protections on GitHub:

1. **Require pull request reviews** before merging
2. **Require status checks** to pass before merging
3. **Require branches to be up to date** before merging
4. **Restrict who can push** to the branch

### For `main` Branch

Keep it flexible for development:

1. Allow direct pushes
2. Optional: Require pull requests for major changes
3. No strict status checks

---

## Common Commands

### Switch Between Branches

```bash
# Switch to main (development)
git checkout main

# Switch to live (production)
git checkout live
```

### Check Current Branch

```bash
git branch
# or
git status
```

### Update Branch from Remote

```bash
# Update current branch
git pull origin <branch-name>

# Update main
git pull origin main

# Update live
git pull origin live
```

### Merge Changes

```bash
# Merge main into live (for production release)
git checkout live
git merge main
git push origin live

# Merge live into main (for hotfixes)
git checkout main
git merge live
git push origin main
```

---

## Best Practices

### ✅ DO

- Develop and test on `main`
- Merge to `live` only when fully tested
- Build production releases from `live`
- Keep `live` clean and stable
- Document all changes in commit messages
- Test thoroughly before merging to `live`

### ❌ DON'T

- Don't push untested code to `live`
- Don't develop directly on `live`
- Don't merge incomplete features to `live`
- Don't skip testing before production merge
- Don't leave debug code in `live`

---

## Release Process

### Standard Release

1. **Develop on `main`:**
   ```bash
   git checkout main
   # Develop and test features
   ```

2. **Test thoroughly:**
   ```bash
   npm run dev
   # Test all features
   ```

3. **Merge to `live`:**
   ```bash
   git checkout live
   git merge main
   git push origin live
   ```

4. **Build production app:**
   ```bash
   npm run electron:build
   ```

5. **Tag the release:**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

---

## Summary

| Branch | Purpose | Stability | Use For |
|--------|---------|-----------|---------|
| `main` | Development | Unstable | Daily development, testing |
| `live` | Production | Stable | Releases, production builds |

**Remember:** Always build production releases from the `live` branch!

---

**Created by:** Manus AI  
**Last Updated:** November 5, 2025

# GitHub Collaboration Guide

This guide will help you and your friend collaborate on this repository together.

## Step 1: Add Your Friend as a Collaborator

1. Go to your GitHub repository: https://github.com/wham346123/tracker
2. Click **Settings** (gear icon)
3. Click **Collaborators** (or **Collaborators and teams** in the left sidebar)
4. Click **Add people**
5. Enter your friend's GitHub username or email
6. Click **Add [username] to this repository**
7. Your friend will receive an email invitation to accept

## Step 2: Your Friend Clones the Repository

Once your friend accepts the invitation, they should:

```bash
# Clone the repository
git clone https://github.com/wham346123/tracker.git

# Navigate into the directory
cd tracker

# Install dependencies (if needed)
npm install
```

## Step 3: Basic Collaboration Workflow

### When Starting Work (BOTH of you):
```bash
# Always pull the latest changes before starting work
git pull origin main
```

### When Making Changes:
```bash
# 1. Make your code changes

# 2. Check what files changed
git status

# 3. Stage your changes
git add .
# Or stage specific files:
# git add path/to/file.js

# 4. Commit with a descriptive message
git commit -m "Description of what you changed"

# 5. Pull any new changes from your friend
git pull origin main

# 6. Push your changes
git push origin main
```

## Step 4: Avoid Conflicts - Use Branches (RECOMMENDED)

To avoid conflicts, work on separate branches:

### Creating Your Own Branch:
```bash
# Create and switch to a new branch
git checkout -b your-feature-name

# Make your changes, then commit
git add .
git commit -m "Your changes"

# Push your branch to GitHub
git push origin your-feature-name
```

### Merging Changes via Pull Requests:
1. Go to GitHub repository
2. Click **Pull Requests** tab
3. Click **New Pull Request**
4. Select your branch to merge into `main`
5. Add description and click **Create Pull Request**
6. Your friend can review and merge it
7. Both pull the latest main branch

## Step 5: Stay Synchronized

### Pull Frequently:
```bash
# Pull changes every time before you start working
git pull origin main

# Or if you're on a different branch, merge main into your branch
git checkout your-branch
git merge main
```

### Check Remote Changes:
```bash
# Fetch to see what's new (doesn't merge yet)
git fetch origin

# See what branches exist
git branch -a

# See commit history
git log --oneline --graph --all
```

## Step 6: Real-Time Collaboration Tools (Optional)

For seeing changes in real-time:

### Option A: VS Code Live Share
1. Install **Live Share** extension in VS Code
2. Click "Live Share" at bottom of VS Code
3. Share the link with your friend
4. Both can edit simultaneously in real-time

### Option B: Git Auto-Pull (Simple Monitoring)
Create a script to auto-pull changes every few minutes:

**Windows (PowerShell):**
```powershell
while ($true) {
    git fetch origin
    $LOCAL = git rev-parse @
    $REMOTE = git rev-parse @{u}
    if ($LOCAL -ne $REMOTE) {
        Write-Host "New changes detected! Pulling..."
        git pull origin main
    }
    Start-Sleep -Seconds 60
}
```

**Mac/Linux (Bash):**
```bash
#!/bin/bash
while true; do
    git fetch origin
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})
    if [ $LOCAL != $REMOTE ]; then
        echo "New changes detected! Pulling..."
        git pull origin main
    fi
    sleep 60
done
```

## Common Scenarios

### Scenario 1: Merge Conflict
```bash
# If git pull shows conflicts:
# 1. Open the conflicted files (marked with <<<<<<<, =======, >>>>>>>)
# 2. Manually resolve conflicts
# 3. Stage the resolved files
git add .
# 4. Complete the merge
git commit -m "Resolved merge conflict"
# 5. Push
git push origin main
```

### Scenario 2: Accidentally Worked on Wrong Branch
```bash
# Save your uncommitted changes
git stash

# Switch to correct branch
git checkout correct-branch

# Restore your changes
git stash pop
```

### Scenario 3: Undo Last Commit (Before Pushing)
```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Undo last commit and discard changes
git reset --hard HEAD~1
```

## Communication Best Practices

1. **Use Descriptive Commit Messages**: "Fixed navigation bug" instead of "fixed stuff"
2. **Coordinate on Slack/Discord**: Let each other know what you're working on
3. **Use GitHub Issues**: Track tasks and bugs
4. **Use GitHub Projects**: Organize work visually
5. **Pull Before Push**: Always `git pull` before `git push`
6. **Small, Frequent Commits**: Better than one huge commit

## Notifications Setup

Enable GitHub notifications to see when your friend pushes:

1. Go to repository on GitHub
2. Click **Watch** button (top right)
3. Select **All Activity**
4. Configure notification preferences in GitHub Settings > Notifications

## Quick Reference Commands

```bash
# See current status
git status

# Pull latest changes
git pull origin main

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push changes
git push origin main

# Create new branch
git checkout -b branch-name

# Switch branches
git checkout branch-name

# See all branches
git branch -a

# Delete local branch
git branch -d branch-name

# Update branch list from remote
git fetch --prune

# See commit history
git log --oneline
```

## Troubleshooting

### "Permission denied" when pushing:
- Your friend needs to accept the collaborator invitation
- Check they're authenticated with GitHub (username/token or SSH key)

### "Divergent branches" warning:
```bash
# Option 1: Always pull with rebase (cleaner history)
git config pull.rebase true

# Option 2: Always merge
git config pull.rebase false
```

### Lost work:
```bash
# Git reflog shows all actions - can recover most things
git reflog
git checkout <commit-hash>
```

---

## Your Current Repository Info

- **Repository**: https://github.com/wham346123/tracker
- **Current Branch**: Check with `git branch`
- **Latest Commit**: 70824e8738c5ec86b568955fcbc431a56c067af1

Good luck collaborating! 🚀

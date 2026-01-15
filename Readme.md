# Commands

GitThe Github Flow
git clone
git checkout -b branch_name
git add .
git commit -m "message"
git push
open a PR
merge or solve mergeConflicts

## 1. Branching commands

- git checkout -b branch-name (to add changes to a new branch)
- git show (to view the history of the project)
- git switch main ( to return to the main branch)
- git branch (to see all the branches)
- git branch -d branch-name (to delete a branch)
- git push --delete origin branch-name (to delete a branch in remomte repository)

## 2. Merging

To merge changes, we must be on the branch where we want to receive the changes.

## 3. Stashing

- git stash (to save the uncommitted changes)
- git stash apply (to apply whatever is stashed away without removing it from the stash, also useful to apply stashed changes to multiple branches)
- git stash pop (to remove the most recently stashed changes from the stash)
- git stash list( to view the stash)
- git stash apply stash@{2} (specifying a particular stash to apply)
- git stash clear ( clearing the stash)

## 4. Rebasing

- It will take all the feature branch commits and move them on top of the main branch and rewrites the commit history.
- We get a clean straight line graph, unlike the merge command.
- commnad: git rebase main or git rebase my_cool_feature

## 5. Reverting

- reverting is like an undo button, suppose if a commit added a file, git revert will create a new commit that deletes that file.
- first we execute git log, then we copy the commit hash(long alphanumeric)
- now we'll do git revert [commit-hash] inside the sq. brackets we'll paste the commit hash

## 6. Resetting

- Git reset moves the branch pointer backwards in time to an earlier commit. It effectively erases the commits.
- It changes the state of three trees(HEAD, index, working directory) to match a previous commit
- The commit that are reset away are no longer visible in your branch log.
- it comes with three flags : --hard, --soft, --mixed
- git reset --soft [commitHash] :It moves the branch pointer back, but it does not touch your files. Git moves the HEAD to an older commit, but it leaves all the changes from the undone commits in Staging Area (green in git status), files remain exactly as they were. It looks like you have the code ready and are just about to commit it again.
- git reset --hard [commmitHash] : It will match the files up to that specific commits and modifies the files and the staging area accordingly.

# Cherry Picking (git cherry-pick)

copies a specific commit from one branch and applies it onto another branch.
Not merging. Not rebasing. Just picking exactly what you want.

# git commit --amend

modifies the most recent commit instead of creating a new one.
It rewrites the commit hash by replacing the last commit with a new one.

Think of it as: “Oops, let me fix that commit before anyone sees it.”

# git rebase

moves your branch commits on top of another base commit, creating a linear history.

Instead of merging, it rewrites commit history.

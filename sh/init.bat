cd ..
git config pull.rebase false
git update-index --assume-unchanged .obsidian/workspace-mobile.json
git update-index --assume-unchanged .obsidian/workspace.json
git update-index --assume-unchanged .obsidian/graph.json
git config --local core.autocrlf input
git config core.quotepath false

git log

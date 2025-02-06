cd ..
git add .
git status
echo "------------------add+status"

set CURRENT_DATE="PC date %date% %time%"
git commit -m %CURRENT_DATE%
echo "------------------commit"

git push
echo "------------------push"

git log --oneline --graph --decorate

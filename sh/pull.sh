cd ..
git add .
git status
echo "------------------add+status"

CURRENT_DATE=`date "+%Y-%m-%d %H:%M:%S"`
git commit -m "PC ${CURRENT_DATE}"
echo "------------------commit"

git pull
echo "------------------push"

git status
git log --oneline --graph --decorate

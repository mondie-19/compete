const cp = require('child_process');
const fs = require('fs');
const log = cp.execSync('git log -n 5 --oneline', {encoding: 'utf8'}).toString();
const stat = cp.execSync('git status -s', {encoding: 'utf8'}).toString();
const diff = cp.execSync('git diff --name-only HEAD~1 HEAD', {encoding: 'utf8'}).toString();
fs.writeFileSync('git_info.json', JSON.stringify({log, stat, diff}, null, 2), 'utf8');

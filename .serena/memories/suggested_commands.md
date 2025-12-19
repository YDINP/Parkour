# Suggested Commands

## NPM Scripts
```bash
# Generate TypeScript types from CSV data files
npm run csv-dts

# Convert JSON to CSV format
npm run tocsv

# Generate enum definitions
npm run gen-enums
```

## Building
Build and run the game through **Cocos Creator Editor** (version 2.4.13).
No CLI build commands available - must use the editor UI.

## Git Commands (Windows)
```bash
# Standard git operations
git status
git add <files>
git commit -m "message"
git push origin <branch>
git pull origin <branch>

# View recent commits
git log --oneline -10
```

## Windows System Commands
```bash
# List files (use ls in Git Bash or dir in CMD)
ls -la         # Git Bash
dir            # CMD/PowerShell

# Find files
find <path> -name "*.ts"    # Git Bash
Get-ChildItem -Recurse -Filter "*.ts"  # PowerShell

# File operations
cat <file>     # Git Bash
type <file>    # CMD
```

## Project-specific Tools (in /tools directory)
- `typing_csv.js` - Generate TS types from CSV
- `tocsv.js` - Convert JSON to CSV
- `genEnums.js` - Generate enum definitions
- `deleteres.js` - Delete resources utility

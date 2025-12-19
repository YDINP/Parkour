# Task Completion Checklist

## Before Marking Task as Complete

### Code Quality
- [ ] Code follows existing naming conventions (see code_style_conventions.md)
- [ ] New code matches the patterns used in the codebase
- [ ] No TypeScript errors (check in Cocos Creator)
- [ ] Chinese/Korean comments are preserved in modified code

### For Prefab Changes (.prefab files)
- [ ] JSON structure is valid
- [ ] `__id__` references are correct
- [ ] UUIDs reference existing assets
- [ ] Test in Cocos Creator Editor

### For CSV Data Changes
- [ ] Run `npm run csv-dts` to regenerate TypeScript types
- [ ] Verify data format matches existing structure

### Testing
- [ ] Open project in Cocos Creator 2.4.13
- [ ] Check for console errors
- [ ] Test affected functionality in preview mode

### Git
- [ ] Review changed files with `git diff`
- [ ] Stage only intended changes
- [ ] Write clear commit message

## No Automated Testing
This project does not have automated test commands. Testing is done manually through Cocos Creator Editor.

## No Linting/Formatting Commands
No automated linting or formatting tools are configured. Follow existing code style manually.

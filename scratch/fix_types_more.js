const fs = require('fs');

async function fixTypes() {
  const filePath = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/mock-test/exam/page.tsx';
  let code = fs.readFileSync(filePath, 'utf8');

  // Let's replace:
  // groups.map((group) => {
  // with:
  // groups.map((group: any[]) => {
  code = code.replace('groups.map((group) => {', 'groups.map((group: any[]) => {');

  // group.map(q => q.id)
  // with:
  // group.map((q: any) => q.id)
  code = code.replace('group.map(q => q.id)', 'group.map((q: any) => q.id)');

  // groupIds.some(id => listenAnswers[id])
  // with:
  // groupIds.some((id: string) => listenAnswers[id])
  code = code.replace('groupIds.some(id => listenAnswers[id])', 'groupIds.some((id: string) => listenAnswers[id])');

  // groupIds.map(id => listenAnswers[id] || '')
  // with:
  // groupIds.map((id: string) => listenAnswers[id] || '')
  code = code.replace('groupIds.map(id => listenAnswers[id] || \'\')', 'groupIds.map((id: string) => listenAnswers[id] || \'\')');

  // groupIds.forEach((id, idx) => {
  // with:
  // groupIds.forEach((id: string, idx: number) => {
  code = code.replace('groupIds.forEach((id, idx) => {', 'groupIds.forEach((id: string, idx: number) => {');

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Fixed implicit any mapping types successfully!');
}
fixTypes();

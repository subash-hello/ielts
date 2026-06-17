const fs = require('fs');

async function fixTypes() {
  const filePath = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/mock-test/exam/page.tsx';
  let code = fs.readFileSync(filePath, 'utf8');

  // Let's replace:
  // const groups = [];
  // let tempGroup = [];
  // with explicit types:
  // const groups: any[] = [];
  // let tempGroup: any[] = [];
  
  code = code.replace('const groups = [];', 'const groups: any[] = [];');
  code = code.replace('let tempGroup = [];', 'let tempGroup: any[] = [];');

  // Let's replace parameters to have explicit types:
  // questions.forEach((q) => { -> questions.forEach((q: any) => {
  // src/app/(dashboard)/mock-test/exam/page.tsx(1260,70): error TS7006: Parameter 'origQ' implicitly has an 'any' type.
  // questions.findIndex((origQ) => -> questions.findIndex((origQ: any) =>
  // opt => -> opt: string => or (opt) => -> (opt: string) =>
  
  code = code.replace('questions.forEach((q) => {', 'questions.forEach((q: any) => {');
  code = code.replace('questions.findIndex((origQ) =>', 'questions.findIndex((origQ: any) =>');
  code = code.replace('representative.options?.map((opt) => {', 'representative.options?.map((opt: string) => {');
  code = code.replace('representative.options?.map((letter) => {', 'representative.options?.map((letter: string) => {');
  code = code.replace('representative.options?.map((opt) => {', 'representative.options?.map((opt: string) => {');
  code = code.replace('((opt) => {', '((opt: string) => {');
  
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Fixed implicit any types successfully!');
}
fixTypes();

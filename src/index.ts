import { resolve } from 'path';
import { collectAnswers } from './prompts.js';
import { scaffold } from './scaffold.js';

async function main(): Promise<void> {
  const answers = await collectAnswers();
  const targetDir = resolve(process.cwd(), answers.projectName);
  await scaffold(answers, targetDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

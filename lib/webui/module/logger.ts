import fs from 'fs';
import path from 'path';

export const getLogList = () => {
  return fs.readdirSync(path.join(process.cwd(), 'logs'));
}

export const readLog = (filename: string) => {
  const file = path.join(process.cwd(), 'logs', filename);
  return fs.readFileSync(file).toString().split('\n');
}
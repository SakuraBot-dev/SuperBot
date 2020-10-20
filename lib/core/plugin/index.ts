import fs from 'fs';
import path from 'path';
import Plugin from './plugin';

const plugins: any[] = [];

const init = () => {
  fs.readdirSync(path.join(__dirname, '../../../plugins')).forEach(file => {
    const id = plugins.length;
    plugins[id] = new Plugin(file, id);
  })
}

export default init;
#!/usr/bin/env node

import path from 'path';
import program from 'commander';
import fs from 'fs';
import { generate, write } from '../index';
import documentation  from 'documentation';

const result = program
  .option('-o, --out-dir <path>', 'Folder for generated docs')
  .arguments('<dirOrFiles>')
  .action(dirOrFiles => {
    let files;
    if (fs.lstatSync(dirOrFiles).isDirectory()) {
      files = fs.readdirSync(dirOrFiles)
        .filter(file => file.endsWith('js'))
        .map(file => path.resolve(dirOrFiles, file));
    } else {
      files = [dirOrFiles];
    }
    const pathnames = files.map(file => path.resolve(process.cwd(), file));
    const packagesDocs = generate(pathnames);
    write(program.outDir, packagesDocs);
  })
  .parse(process.argv);

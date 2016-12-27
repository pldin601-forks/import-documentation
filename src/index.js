// @flow

import 'babel-polyfill';

import path from 'path';
import fs from 'fs';
import esprima from 'esprima';
import getInstalledPath from 'get-installed-path';
import documentation from 'documentation';

const getLocalName = specifier => {
  const map = {
    ImportDefaultSpecifier: (s) => { return {
      'importType': 'importDefault', 
      'importName': s.local.name } 
    },
    ImportSpecifier: (s) => { return { 
      'importType': 'import', 
      'importName': s.imported.name 
    } },
  };

  return map[specifier.type](specifier);
};

export const generate = files => {
  const contents = files.map(file => fs.readFileSync(file, 'utf8'));
  const programs = contents.map(content => esprima.parse(content, { sourceType: 'module' }));
  const imports = programs.reduce((acc, program) => {
    const programImports = program.body.filter(item => item.type === 'ImportDeclaration')
      .filter(item => item.source.value.startsWith('hexlet'));
    return [...acc, ...programImports];
  }, {});

  const packages = imports.reduce((acc, importDeclaration) => {
    const previousSpecifiers = acc[importDeclaration.source.value] || new Set();
    const filteredSpecifiers = importDeclaration.specifiers.filter(s => s.type !== 'ImportNamespaceSpecifier');
    const newSpecifiers = filteredSpecifiers.reduce((specifiers, specifier) =>
      specifiers.add(getLocalName(specifier)), previousSpecifiers);
    return { ...acc, [importDeclaration.source.value]: newSpecifiers };
  }, {});

  return Object.keys(packages).map(packageName => {
    const packagePath = getInstalledPath.sync(packageName);
    const resolvedPath = path.resolve(packagePath, 'src', 'index.js');
    const allPackageDocs = documentation.buildSync([resolvedPath]);
    console.log(allPackageDocs);
    const functions = [...packages[packageName]];
    const packageDocsAll = functions.map(({ importType, importName }) => {
      const docs = allPackageDocs.find(item => 
          importType === 'importDefault' 
            ? (item.name === importName || item.name === 'index') 
            : item.name === importName);
      if (docs === undefined) {
        console.warn(`Documentation for function "${importName}" not found!`);
      }
      return docs;
    });
    const packageDocs = packageDocsAll.filter(obj => obj !== undefined);
    return { packageName, packageDocs };
  });
};

export const write = (dir, docs) => {
  docs.forEach(({ packageName, packageDocs }) => {
    if (packageDocs.length == 0) {
      console.warn(`Package "${packageName}" has not documented!`);
      return;
    }
    documentation.formats.md(packageDocs, {}, (err, res) => {
      if (err) {
        throw err;
      }
      fs.writeFileSync(path.resolve(dir, `${packageName}.md`), res);
    });
  });
};

// @flow

import 'babel-polyfill';

import fs from 'fs';
import esprima from 'esprima';

// read file
// parse file
// extract functions
// load docs
// return

const getLocalName = specifier => {
  const map = {
    ImportDefaultSpecifier: (s) => s.local.name,
    ImportSpecifier: (s) => s.imported.name,
  };

  return map[specifier.type](specifier);
};

export default files => {
  // code
  const contents = files.map(file => fs.readFileSync(file, 'utf8'));
  const programs = contents.map(content => esprima.parse(content, { sourceType: 'module' }));
  const imports = programs.reduce((acc, program) => {
    const programImports = program.body.filter(item => item.type == 'ImportDeclaration')
      .filter(item => item.source.value.startsWith('hexlet'));
    return [...acc, ...programImports];
  }, {});

  const functions = imports.reduce((acc, importDeclaration) => {
    const previousSpecifiers = acc[importDeclaration.source.value] || new Set();
    const filteredSpecifiers = importDeclaration.specifiers.filter(s => s.type !== 'ImportNamespaceSpecifier');
    const newSpecifiers = filteredSpecifiers.reduce((specifiers, specifier) =>
      specifiers.add(getLocalName(specifier)), previousSpecifiers);
    return { ...acc, [importDeclaration.source.value]: newSpecifiers };
  }, {});
  console.log(functions);
};

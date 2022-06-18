import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main.js';
import package_json from "./../package.json" assert {type: "json"};


function parseArgumentsIntoOptions(rawArgs) {
  const args = arg({
    '--compile': Boolean,
    '--version': Boolean,
    '--git': Boolean,
    '--yes': Boolean,
    '--install': Boolean,
    '--init':    String,
    '--template':    String,
    '-c': '--compile',
    '-v': '--version',
    '-g': '--git',
    '-y': '--yes',
    '-tpl': '--template',
    '-i': '--install'
  });

  return {
    compile: args['--compile'] || false,
    version: args['--version'] || false,
    skipPrompts: args['--yes'] || false,
    git: args['--git'] || false,
    init: args['--init'] || false,
    template: args['--template'] || false,
    targetDirectory: args._[0] || false,
    runInstall: args['--install'] || false,
  };
}

async function getVersion() {
  return package_json.version
}

async function promptForMissingOptions(options) {
  if (options.version) {
    const version = await getVersion()
    console.log(`** Macchina cli version: ${version}`)
    return
  }
  const defaultTemplate = 'Barebones';
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate,
    };
  }

  const questions = [];
  if (!options.template && !options.compile) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Please choose which project template to use',
      choices: ['Barebones', 'Svelte'],
      default: defaultTemplate,
    });
  }

  if (!options.git && !options.compile) {
    questions.push({
      type: 'confirm',
      name: 'git',
      message: 'Initialize a git repository?',
      default: false,
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
    git: options.git || answers.git,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await createProject(options);
}

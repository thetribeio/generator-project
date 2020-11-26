const Generator = require('yeoman-generator');
const chalk = require('chalk');

module.exports = class extends Generator {
    end() {
        console.log(chalk.bold.green('finished'));
    }
}
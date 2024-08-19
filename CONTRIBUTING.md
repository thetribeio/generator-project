# @thetribe/generator-project

## Yeoman concept

The tool behind the generator is [Yeoman](https://yeoman.io/)

Its main concept is the `generator` class with built in method called during its lifecycle

Those built in methods allow you to :
* leverage prompts in the CLI to get user input
* interact with the file system and use templates
* composition with others generators
* pass arguments/options from the CLI

see https://yeoman.io/authoring/ for more information

## Project structure

In our project structure we currently have several generators

### AppGenerator:

This is the base generator, that rules them all :
- responsible to collect most of the project information from the user through prompts,
- configuring the project devOps tooling (ansible, docker-compose, circleCi)
- responsible for calling the sub Generators

### RootGenerator:

A root generator which can be invoked to generate a bare project see [Manual mode](doc/QUICKSTART.md#manual-mode)

### ExpressGenerator:

The sub-generator for the backend responsible to create/template backend files for the project

### CreateReactAppGenerator and NextjsGenerator:

Both of them are sub-generators responsible for their respective frontend stack, providing the templated files to the
project

## Testing approach

For the tests we aim to test :
- utils function
- output files and templates are properly created
- linters on output files
- sub-generators are being called
- prompts input are properly forwarded / trigger expected behaviours

This is not an exhaustive list, rather common sense test approach :)

## Useful resources

* [CI project](https://app.circleci.com/pipelines/github/thetribeio/generator-project)
* [Yeoman authoring guide](https://yeoman.io/authoring/)
* [Yeoman full API](https://yeoman.github.io/generator/)

## Install the project

The project uses [Corepack](https://nodejs.org/api/corepack.html) to ensure the correct version of Yarn is used, ensure
Corepack is enabled by running `corepack enable`.

Install the dependencies with `yarn install`

## Build

Build the project with `yarn build`

## Test the generator

- Install yeoman: `yarn global add yo`
- Go the dist directory and link the built generator: `(cd dist && yarn link)`
- Yo can now test your generator by following the [usage documentation](doc/QUICKSTART.md#QuickStart)

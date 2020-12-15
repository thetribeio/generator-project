# @thetribe/generator-project


## Why do we do the project generator 
During the bootstrap of each project we write a lot of configurations boilerplate - spending each time a few days doing the same taks again and again

The generator is here to make us more efficient when starting a new project by generating a scaffolded project: 

* add boilerplate configuration automatically (ansible, docker-compose, circleci, linters)
* generate the folder/files boilerplate for both front end and backend
* make the code base easier to navigate with a conventional tooling and approach between projects
* configure the testing tools and make them ready for when you need them. 

## Chosen Stack
The current MVP covers the most used technologies which are : 
* DevOps : Ansible, docker-compose, circleCi
* Backend : Node / Express / TypeORM
* Frontend : React with CRA / Next boilerplate
* Miscellaneous : Cypress / Jest  

More languages/tools will come in the future. You can refer/share your input in the [trello board](https://trello.com/b/T2yA4yFF/generateur-scrum-board)

## Project structure and concept

The main tool behind the generator is [Yeoman](https://yeoman.io/)

It allows us to leverage the concept of a `generator`. A class exposed by Yeoman that allow us to : 
* create prompts for the user
* invoke other generator 
* create and generate files/templates

As per our project structure we currently have several differents generators

**AppGenerator :** 

This is the base generator, that rules them all : 
- responsible to collect most of the project information from the user through prompts, 
- configuring the project devOps tooling (ansible, docker-compose, circleCi)
- responsible for calling the sub Generators

**RootGenerator :** A root generator which can be invoked to generate a bare project see [Manual mode](#manual-mode) 

**NodeGenerator :**  The sub-generator for the backend responsible to create/template backend files for the project 

**CreateReactAppGenerator and NextjsGenerator :** Both of them are sub-generators responsible for their respective frontend stack, providing the templated files to the project


## Yeoman concept to know to start contributing

Yeoman is mainly based on the `generator` concept. A Generator is basically a class with built in method called during its lifecycle

Those built in methods allow you to : 
* leverage prompts in the CLI to get user input
* interact with the file system and use templates
* composition with others generators
* pass arguments/options from the CLI

see https://yeoman.io/authoring/ for more information
 

## Testing approach

For the tests we aim to test :
- utils function
- output files and templates are properly created
- linters on output files
- sub-generators are being called
- prompts input are properly forwarded / trigger expected behaviours

This is not an exhaustive list, rather common sense test approach :)  


## If you encounter an issue while using the generator 

If you encounter any issue while using the generator or contributing on it. 

Please create a new trello card using the **Generator Issue** model card in the triage column from the [Generator Trello Board](https://trello.com/b/T2yA4yFF/generateur-scrum-board)


## Useful resources 
* [CI project](https://app.circleci.com/pipelines/github/thetribeio/generator-project)
* [Yeoman authoring guide](https://yeoman.io/authoring/)
* [Yeoman full API](https://yeoman.github.io/generator/)
* [Generator Trello Board](https://trello.com/b/T2yA4yFF/generateur-scrum-board)
* [Slack channel ](https://app.slack.com/client/T0EMTFESW/C019M7EEBT5/thread/C0EMTFF50-1607075028.358400)

## Install the project

Install the dependencies with `yarn install`

## Build

Build the project with `yarn build`

## Test the generator

- Install yeoman: `yarn global add yo`
- Go the dist directory and link the built generator: `(cd dist && yarn link)`
- Yo can now test your generator by following the [usage documentation](#usage)

## Usage

### Guided mode

Run `yo @thetribe/project` and follow the prompts to generate your project

### Manual mode

Run `yo @thetribe/project:root` to generate a bare root project and then
[add more components to your project](#add-more-components)

### Add more components

You can add more components to an existing project with the following commands:
 - `yo @thetribe/project:create-react-app [name]`
 - `yo @thetribe/project:express [name]`
 - `yo @thetribe/project:next-js [name]`

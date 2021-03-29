# @thetribe/generator-project

## Why do we do the project generator ?

During the bootstrap of each project we write a lot of configuration boilerplate - spending each time a few days doing the same tasks again and again

The generator is here to make us more efficient when starting a new project by generating a scaffolded project:

* add boilerplate configuration automatically (ansible, docker-compose, circleci, linters)
* generate the folder/files boilerplate for both front end and backend
* make the code base easier to navigate with a conventional tooling and approach between projects
* configure the testing tools and make them ready for when you need them.

## Chosen Stack

The current MVP covers the most used technologies which are:
* DevOps: Ansible, docker-compose, circleCi
* Backend: Node + Express + TypeORM / Symfony
* Frontend: React with CRA / Next boilerplate
* Miscellaneous: Cypress / Jest

More languages/tools will come in the future.

## Usage

- Install yeoman and the generator: `yarn global add yo @thetribe/generator-project`
- Create a new directory for your project and go to it

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

### Push your project

- Create a new GitHub repository with the name you specified in the configuration
- Create an initial commit in your project folder
- And push it with `git push --set-upstream origin master`

## If you encounter an issue while using the generator

If you encounter any issue while using the generator or contributing on it please create a issue in this repository.

## Contributing

You can contribute to this repository by following the [contributing guide](CONTRIBUTING.md)

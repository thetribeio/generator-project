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

You can use the generator by following the [quickstart guide](doc/QUICKSTART.md)

## Contributing

You can contribute to this repository by following the [contributing guide](CONTRIBUTING.md)

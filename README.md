# @thetribe/generator-project

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

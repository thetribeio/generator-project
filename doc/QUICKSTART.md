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

If you encounter any issue while using the generator or contributing on it please create an issue in this repository.

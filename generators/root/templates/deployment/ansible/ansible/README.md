# Where to put what

To properly kickstart ansible in your project, take care of the files in the order
they're listed in here. It will probably be the easiest order to implement ansible :)

## `ansible.cfg`

Note that you probably don't need to touch this file! Below is just explanations.

- `vault_password_file` indicates where the vault's password is stored. This file should never
  appear in git's history, so it should be added to `.gitignore`.
- `roles_path` allows ansible ansible to find roles in both the `roles` and `roles-lib` directories.

## Inventories

The `staging.py` and `production.py` are inventory scripts that automaticaly
pulls servers informations from terraform outputs. To use them you need to
[setup terraform](../terraform/README.md#Configuration) and 
[create your environment](../terraform/README.md#creating-or-updating-an-environment).

## Roles

theTribe uses a roles library. An ansible role is like a function that contains
predefined actions, so you don't have to rewrite everything everytime.

This library is loaded into the project using the `role-lib` submodule.

Ansible will looks for roles in both the `roles`, and `roles-lib` folders.

If you want to create custom roles for your project, just create a new folder in `roles/`
and take notes from the already existing roles in the `roles-lib` folder.

## Var files

Var files are located in the `vars` directory.

You can use these files' contents as playbook variables like this:
```yaml
- name: Include some variables for this task
  vars_files:
    - vars/variables.yaml
```

Some `folder-roles` (`build`, `deploy`) require the presence of `circleci.yaml`
and `github.yaml`. Use the `.dist` files in the `vars/` folder to create them, and
follow their instructions to fill them.

These two files should be in your `.gitignore`:
- `vars/github.yaml`
- `vars/circleci.yaml`

## Group vars

Group var files are located in the `group_vars` directory.

These are loaded automatically based on the inventory you're using.

For example, any variable defined in `group_vars/staging.yaml` will be available
globally if you're running ansible with the `staging` inventory:
```bash
ansible-playbook -i staging.py <playbook>.yaml
```

The `group_vars/all.yaml` group vars file is special: its content is always loaded.

What you should put in `group_vars/all.yaml`:
- The variables that are the same no matter the target
- The default values of variables that could change depending on the target

What you should put in `groups_vars/staging.yaml`:
- The variables that are specific to your `staging` remote server

## Playbooks

You have two empty playbooks: `provision.yaml` and `deployment.yaml`.

I recommend taking other projects you worked on as example to fill these in.

Good luck!

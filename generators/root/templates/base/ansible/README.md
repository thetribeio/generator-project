# Where to put what

To properly kickstart ansible in your project, take care of the files in the order
they're listed in here. It will probably be the easiest order to implement ansible :)

## `ansible.cfg`

Note that you probably don't need to touch this file! Below is just explanations.

- `vault_password_file` indicates where the vault's password is stored. This file should never
  appear in git's history, so it should be added to `.gitignore`.
- `hash_behaviour` allows ansible to merge configuration objects. You can for exemple define
  something like this in `group_vars/all.yaml`:
```yaml
---
project_configuration:
  folder: /var/www/myproject
  branch: master
```
  And have additional `project_configuration` fields in `group_vars/staging.yaml`:
```yaml
---
project_configuration:
  branch: develop
  contact: thomas.barusseau@thetribe.io
```
  Which would result in the following object when running with the `staging` inventory:
```yaml
---
project_configuration:
  folder: /var/www/myproject
  branch: develop
  contact: thomas.barusseau@thetribe.io
```
- `roles_path` allows ansible ansible to find roles in both the `roles` and `roles-lib` directories.

## Generating `vault_pass.txt`

If you're not on a UNIX environment, you're on your own.

Run this command:
```bash
< /dev/urandom tr -cd "[:print:]" | head -c 64 >vault_pass.txt
```

If you're on MacOS, run this command:
```bash
openssl rand -base64 64 >vault_pass.txt
```

## Inventory files

You usually have one inventory file per target: `staging`, `production`...

Let's check `staging`:

```
[staging]
staging_host ansible_host=127.0.0.1 ansible_user=root ansible_python_interpreter=python3
```

- `[staging]` is the inventory's name (just use the filename)
- `staging_host` is the name of the remote host, and will be used in playbooks
- `ansible_host` is the IP address of the remote host
- `ansible_user` is the user that should be used when ansible will connect through SSH
- `ansible_python_interpreter` tells ansible which python version it should use. Some
  servers might only have python2.7, for example

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
ansible-playbook -i staging <playbook>.yaml
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

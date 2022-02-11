# Terraform

Terraform is a tool that allows to automate the creation of servers. The terraform configuration of this repository
is split into 3 parts:
 - `common`: the configuration that is common to all environments
 - `production`: the configuration for the production environment
 - `staging`: the configuration fof the staging environment

You can find the tutorial to install terraform [here](https://learn.hashicorp.com/tutorials/terraform/install-cli).

# Usage

## Configuration

You need first to configure the Scaleway credentials for the environment you want to use.

First you need to create a Scaleway API key and secret [here](https://console.scaleway.com/project/credentials).

You must then copy the `scaleway project id` in  `terraform/{environment}/main.tf`, as well as a bucket id.
You can create or use an already existing bucket here [here](https://console.scaleway.com/object-storage/buckets).

Then you need to go to the folder corresponding to the environment you want to configure and run
`terraform init -backend-config="access_key={your scw_access_key}" -backend-config="secret_key={your scw_secret_key}"`
to initialize terraform.

Then you need to create the `terraform.tfvars` file following the `terraform.tfvars.example` example.

## Creating or updating an environment

To create or update an environment, go to the corresponding folder and run `terraform apply`, you will then be
presented with the changes terraform want to do, you can then accept these changes or cancel everything.

Alternatively, you can run `terraform plan` to see what terraform would do if you apply the configuration.

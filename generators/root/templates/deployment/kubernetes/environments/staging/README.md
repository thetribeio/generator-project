# Terraform

Terraform is a tool that allows to automate the creation of servers. The terraform configuration of this repository
is split into several parts, following the required environments:
 - `staging`: the configuration for the staging environment
 - any other environment you need (for instance `production` or `cdn`)

You can find the tutorial to install terraform [here](https://learn.hashicorp.com/tutorials/terraform/install-cli).

# Usage

## Configuration

You need first to configure the credentials for the environment you want to use.

First you need to create an API key and secret [here](https://console.scaleway.com/project/credentials).

You must then copy the `scaleway project id` in  `terraform/{environment}/main.tf`, as well as the bucket id that you
can create here [here](https://console.scaleway.com/object-storage/buckets)

Then you need to go to the folder corresponding to the environment you want to configure and run
`terraform init -backend-config="access_key={your scw_access_key}" -backend-config="secret_key={your scw_secret_key}"`
to initialize terraform.

Then you need to create the `terraform.tfvars` file following the `terraform.tfvars.example` example.

## Creating or updating an environment

To create or update an environment, go to the corresponding folder and run `terraform apply`, you will then be
presented with the changes terraform want to do, you can then accept these changes or cancel everything.

Alternatively, you can run `terraform plan` to see what terraform would do if you apply the configuration.


## Read a secret
To reveal a secret such as the default basic auth password generated, use
```
terraform output basic_auth_password
```

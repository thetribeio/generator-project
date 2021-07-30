# Configuration

Initialize terraform with `terraform init -backend-config="access_key={your scw_access_key}" -backend-config="secret_key={your scw_secret_key}"`

Create the `terraform.tfvars` file following the `terraform.tfvars.example` example

# Switch workspace

`terraform workspace select [staging|production]`

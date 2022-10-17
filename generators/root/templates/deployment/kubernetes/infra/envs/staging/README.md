# Usage

## Configuration

First you need to create a Scaleway API key and secret [here](https://console.scaleway.com/project/credentials).

Then you need to run initialize terraform with:

```
terraform init --backend-config="access_key={your scw_access_key}" --backend-config="secret_key={your scw_secret_key}"
```

Then you need to create the `terraform.tfvars` file following the `terraform.tfvars.example` example.

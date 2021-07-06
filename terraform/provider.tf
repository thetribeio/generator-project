terraform {
    required_providers {
        scaleway = {
            source  = "scaleway/scaleway"
            version = "~> 1.17.2"
        }
    }

    backend "s3" {
        bucket                      = "thetribe-terraform-states"
        key                         = "create-react-app.tfstate"
        region                      = "fr-par"
        endpoint                    = "https://s3.fr-par.scw.cloud"
        skip_credentials_validation = true
        skip_region_validation      = true
    }
}

provider "scaleway" {
    zone       = "fr-par-1"
    region     = "fr-par"
}

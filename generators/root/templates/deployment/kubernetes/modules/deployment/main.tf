terraform {
    required_providers {
        docker = {
            source  = "kreuzwerker/docker"
            version = ">= 2.15.0"
        }
        helm = {
            source  = "hashicorp/helm"
            version = ">= 2.2.0"
        }
        scaleway = {
            source  = "scaleway/scaleway"
            version = ">= 2.2.0"
        }
    }
}

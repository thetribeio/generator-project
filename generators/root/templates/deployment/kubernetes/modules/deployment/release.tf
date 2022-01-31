resource "helm_release" "main" {
    name      = var.release_name
    namespace = var.release_namespace

    chart = "${path.module}/chart/"

    set {
        name  = "environment_name"
        value = var.environment_name
    }

    set {
        name  = "host"
        value = var.host
    }

    set {
        name  = "certificate"
        value = var.certificate
    }

    set {
        name  = "registry"
        value = var.registry
    }

    set {
        name  = "basic_auth_password"
        value = var.basic_auth ? random_password.basic_auth : null
    }
}

resource "random_password" "basic_auth" {
    length = 16
}

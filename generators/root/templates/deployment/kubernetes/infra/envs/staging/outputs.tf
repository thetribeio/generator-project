output "basic_auth_password" {
    value     = module.deployment.basic_auth_password
    sensitive = true
}

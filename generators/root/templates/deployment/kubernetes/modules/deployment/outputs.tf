output "basic_auth_password" {
    value     = random_password.basic_auth
    sensitive = true
}

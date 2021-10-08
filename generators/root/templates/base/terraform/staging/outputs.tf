output "hosts" {
    value = {
        server = module.server.ip
    }
}

output "vars" {
    value = {
        database_host = "localhost"
    }
}

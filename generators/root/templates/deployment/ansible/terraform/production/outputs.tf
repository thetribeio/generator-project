output "hosts" {
    value = {
        server = module.server.ip
    }
}

output "vars" {
    value = {
        database_host = "${module.database.ip}:${module.database.port}"
    }
}

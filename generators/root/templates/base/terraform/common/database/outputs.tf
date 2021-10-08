output "ip" {
    value = scaleway_rdb_instance.database.endpoint_ip
}

output "port" {
    value = scaleway_rdb_instance.database.endpoint_port
}

output "servers" {
    value = {
        "server" = scaleway_instance_ip.server_public_ip.address
    }
}

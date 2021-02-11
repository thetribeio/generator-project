#!/usr/bin/env python3
import json
import os
import subprocess

rootPath = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
terraformPath = rootPath + "/terraform/"

def terraform(command):
    process = subprocess.run(["terraform"] + command, capture_output=True, encoding="utf8", cwd=terraformPath)

    return process.stdout

def main():
    workspace = terraform(["workspace", "show"]).strip()
    servers = json.loads(terraform(["output", "--json", "servers"]))

    print(json.dumps({
        "_meta": {
            "hostvars": {
                server: {
                    "ansible_host": ip,
                    "ansible_python_interpreter": "python3",
                    "ansible_user": "root",
                } for server, ip in servers.items()
            }
        },
        workspace: {
            "hosts": list(servers.keys()),
        },
    }))

if __name__ == "__main__":
    main()

#!/usr/bin/env python3

"""
Inventory script
"""

import json
import os
import subprocess

ROOT_PATH = os.path.dirname(os.path.realpath(__file__))

def terraform(command):
    """
    Run a terraform command and returns the ouput
    """
    process = subprocess.run(
        ["terraform"] + command,
        capture_output=True,
        encoding="utf8",
        cwd=ROOT_PATH,
        check=True,
    )

    return process.stdout


def terraform_output(name):
    """
    Extract data from terraform output
    """
    return json.loads(terraform(environment, ["output", "--json", name]))


def inventory():
    """
    Build and print the inventory string for an environment
    """
    group_hosts = terraform_output(environment, "hosts")
    group_vars = terraform_output(environment, "vars")

    print(
        json.dumps(
            {
                "_meta": {
                    "hostvars": {
                        server: {
                            "ansible_host": ip,
                            "ansible_python_interpreter": "python3",
                            "ansible_user": "root",
                        }
                        for server, ip in group_hosts.items()
                    }
                },
                "all": {
                    "hosts": list(group_hosts.keys()),
                    "vars": group_vars,
                },
            }
        )
    )

if __name__ == "__main__":
    inventory()

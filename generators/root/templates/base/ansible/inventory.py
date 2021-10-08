"""
Inventory script library
"""

import json
import os
import subprocess

ROOT_PATH = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))


def terraform(environment, command):
    """
    Run a terraform command and returns the ouput
    """
    process = subprocess.run(
        ["terraform"] + command,
        capture_output=True,
        encoding="utf8",
        cwd=f"{ROOT_PATH}/terraform/{environment}",
        check=True,
    )

    return process.stdout


def terraform_output(environment, name):
    """
    Extract data from terraform output
    """
    return json.loads(terraform(environment, ["output", "--json", name]))


def inventory(environment):
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
                environment: {
                    "hosts": list(group_hosts.keys()),
                    "vars": group_vars,
                },
            }
        )
    )

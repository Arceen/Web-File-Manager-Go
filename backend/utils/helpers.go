package utils

import (
	"fmt"
	"os/exec"
)

func ExecuteCommand(command string) (string, error) {
	fmt.Println("Execute Command")
	fmt.Println(command)
	output, err := exec.Command("cmd.exe", "/C", command).Output()
	fmt.Println(output)
	fmt.Println(string(output))
	if err != nil {
		fmt.Println(err.Error())
		return "", err
	}

	return string(output), nil
}

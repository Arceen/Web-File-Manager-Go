package main

import (
	"backend/utils"
	"fmt"
	"image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/kbinani/screenshot"
)

func getAllFiles(c *gin.Context) {
	var requestBody map[string]string
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// fmt.Println(requestBody["path"])
	path := requestBody["path"]
	if path == "" {
		// If no path parameter is provided, list volumes
		volumes, err := getVolumes()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"volumes": volumes})
		return
	}

	// If a path parameter is provided, list files and directories in that path

	files, folders, err := getFilesInDir(path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"files": files, "folders": folders})
}

func getVolumes() ([]string, error) {
	var volumes []string
	// Find volumes on Windows
	if filepath.Separator == '\\' {
		// Iterate through drive letters
		for _, drive := range "ABCDEFGHIJKLMNOPQRSTUVWXYZ" {
			volume := string(drive) + ":"
			_, err := os.Stat(volume)
			if err == nil {
				volumes = append(volumes, volume)
			}
		}
	}

	return volumes, nil
}
func serveFile(c *gin.Context) {
	var requestBody map[string]string
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	filePath := requestBody["path"]
	file, err := os.Open(filePath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}
	defer file.Close()

	io.Copy(c.Writer, file)
}
func getFilesInDir(dirPath string) ([]utils.FormattedFile, []utils.FormattedFolder, error) {
	var files []utils.File
	var folders []utils.Folder
	dirInfo, err := os.Stat(dirPath)
	if err != nil {
		return nil, nil, err
	}

	if !dirInfo.IsDir() {
		return nil, nil, fmt.Errorf("provided path is not a directory: %s", dirPath)
	}

	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, nil, err
	}

	for _, entry := range entries {
		// Check if it's a regular file or a directory
		if entry.IsDir() {
			newFolder := utils.Folder{
				Name:     entry.Name(),
				Modified: time.Now(),
			}
			folders = append(folders, newFolder)
		} else {
			// Get the fileinfo
			fileInfo, err := os.Stat(filepath.Join(dirPath, entry.Name()))

			// Checks for the error
			if err != nil {
				return nil, nil, err
			}
			newFile := utils.File{
				Name:      entry.Name(),
				Size:      fileInfo.Size(),
				Modified:  fileInfo.ModTime(),
				FullPath:  filepath.Join(dirPath, entry.Name()),
				Extension: utils.GetFileExtension(entry.Name()),
			}
			newFile.FullPath = strings.ReplaceAll(newFile.FullPath, "\\", `\`)
			files = append(files, newFile)
		}
	}

	return utils.FormattedFiles(files), utils.FormattedFolders(folders), nil
}

func executeCommand(c *gin.Context) {
	var requestBody map[string]string
	fmt.Println("Here comes to executeCommand")
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println(requestBody)
	command := string(requestBody["command"])
	fmt.Println(command)
	output, err := utils.ExecuteCommand(command)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error executing command: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"output": output})
}

func getScreenshot(c *gin.Context) {
	img, err := screenshot.CaptureDisplay(0)
	if err != nil {
		fmt.Printf("Failed to capture screen: %v\n", err)
		return
	}
	err = png.Encode(c.Writer, img)
	if err != nil {
		fmt.Println("Screenshot can't be sent")
	} else {
		fmt.Println("Screenshot sent")
	}
}

func main() {
	router := gin.Default()

	// Configuration of CORS to serve on specific ports and allow all headers (for htmx)
	corsMiddlewareConfig := cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"PUT", "POST", "GET", "OPTIONS", "DELETE"},
		AllowHeaders: []string{"*"},
	})
	router.Use(corsMiddlewareConfig)

	// Define the endpoint for getting the list of files
	router.POST("/files/", getAllFiles)
	router.POST("/download/", serveFile)
	router.POST("/execute/", executeCommand)
	router.GET("/screenshot/", getScreenshot)
	port := 8005
	fmt.Printf("Starting file server on port %d...\n", port)
	err := router.Run(fmt.Sprintf(":%d", port))
	if err != nil {
		fmt.Println("Error:", err)
	}
}

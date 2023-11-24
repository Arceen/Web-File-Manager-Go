package utils

import (
	"fmt"
	"strings"
	"time"
)

func FormattedFiles(files []File) []FormattedFile {
	// I want all the processing done on backend
	formattedFiles := []FormattedFile{}

	for _, f := range files {
		formattedF := FormattedFile{
			Name:      f.Name,
			Modified:  formatDate(f.Modified),
			Size:      formatFileSize(f.Size),
			FullPath:  f.FullPath,
			Extension: f.Extension,
		}
		formattedFiles = append(formattedFiles, formattedF)
	}
	fmt.Println(formattedFiles)
	return formattedFiles
}

func FormattedFolders(folders []Folder) []FormattedFolder {
	// I want all the processing done on backend
	formattedFolders := []FormattedFolder{}

	for _, f := range folders {
		formattedF := FormattedFolder{
			Name:     f.Name,
			Modified: formatDate(f.Modified),
		}
		formattedFolders = append(formattedFolders, formattedF)
	}
	fmt.Println(formattedFolders)
	return formattedFolders
}

func formatDate(time time.Time) string {
	return time.Format("02 Jan 2006")
}

func formatFileSize(size int64) string {
	const (
		_        = iota
		kiloByte = 1 << (10 * iota)
		megaByte
		gigaByte
		teraByte
		petaByte
		exaByte
	)

	switch {
	case size < kiloByte:
		return fmt.Sprintf("%d B", size)
	case size < megaByte:
		return fmt.Sprintf("%.2f KB", float64(size)/float64(kiloByte))
	case size < gigaByte:
		return fmt.Sprintf("%.2f MB", float64(size)/float64(megaByte))
	case size < teraByte:
		return fmt.Sprintf("%.2f GB", float64(size)/float64(gigaByte))
	case size < petaByte:
		return fmt.Sprintf("%.2f TB", float64(size)/float64(teraByte))
	case size < exaByte:
		return fmt.Sprintf("%.2f PB", float64(size)/float64(petaByte))
	default:
		return fmt.Sprintf("%.2f EB", float64(size)/float64(exaByte))
	}
}
func GetFileExtension(fileName string) string {

	ss := strings.Split(fileName, ".")
	ext := ss[len(ss)-1]
	return "." + ext
}

package utils

import "time"

type File struct {
	Name      string    `json:"name"`
	Modified  time.Time `json:"modified"`
	Size      int64     `json:"size"`
	Extension string    `json:"file_extension"`
	FullPath  string    `json:"full_path"`
}

type Folder struct {
	Name     string    `json:"name"`
	Modified time.Time `json:"modified"`
}

type FormattedFile struct {
	Name      string `json:"name"`
	Modified  string `json:"modified"`
	Size      string `json:"size"`
	FullPath  string `json:"full_path"`
	Extension string `json:"file_extension"`
}

type FormattedFolder struct {
	Name     string `json:"name"`
	Modified string `json:"modified"`
}

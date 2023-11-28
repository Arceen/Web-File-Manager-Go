// Constants

const API_ENDPOINT = "http://localhost:8005/";
const TEXT_EXTENSIONS = [
  ".txt",
  ".log",
  ".sys",
  ".py",
  ".c",
  ".go",
  ".cpp",
  ".pdf",
  ".doc",
  ".docx",
];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];
const VIDEO_EXTENSIONS = [".mp4", ".ogg", ".webm"];
const AUDIO_EXTENSIONS = [".mp3", ".ogg", ".wav"];
let currentBrowsePath = localStorage.getItem("currentBrowsePath");
currentBrowsePath = currentBrowsePath == null ? "" : currentBrowsePath;

window.onload = () => {
  getRemoteFilesNFolders(currentBrowsePath);
};

const moveToChildFolder = (currentPath, folder) => {
  if (currentPath === "") {
    currentPath += folder + "//";
  } else {
    currentPath += "/" + folder;
  }

  currentPath.replaceAll("///", "//");
  changeSavedPath(currentPath);
  return currentPath;
};
const changeSavedPath = (currentPath) => {
  imageRequests = [];
  localStorage.setItem("currentBrowsePath", currentPath);
  currentBrowsePath = currentPath;
};

const getParsedBackPath = (currentPath) => {
  if (currentPath.endsWith("//")) return "";
  let splitVolume = currentPath.split("//");
  let splitDirs = splitVolume[1].split("/");
  splitDirs.pop();
  let joinedDirs = splitDirs.join("/");
  splitVolume[1] = joinedDirs;
  newPath = splitVolume.join("//");
  return newPath.replaceAll("///", "//");
};

const goBackPath = () => {
  const newPath = getParsedBackPath(currentBrowsePath);
  console.log(newPath);
  changeSavedPath(newPath);
  getRemoteFilesNFolders(newPath);
};
const getRemoteFilesNFolders = (newPath) => {
  axios
    .post(`${API_ENDPOINT}files/`, {
      path: newPath,
    })
    .then((res) => {
      const data = res.data;
      console.log(data);
      renderFileFetchResponse(newPath, data);
    })
    .catch((err) => {
      console.log(err);
    });
};
const getImagesFromName = async (data) => {
  console.log(data);

  if (!("files" in data)) {
    return data;
  }

  const downloadPromises = [];

  for (let file of data["files"]) {
    if (IMAGE_EXTENSIONS.includes(file["file_extension"].toLowerCase())) {
      console.log(file["full_path"]);
      downloadPromises.push(
        downloadImageAndGetSRC(file["name"], file["full_path"]),
      );
    }
  }

  const imageSources = await Promise.all(downloadPromises);

  data["files"].forEach((file, index) => {
    if (IMAGE_EXTENSIONS.includes(file["file_extension"].toLowerCase())) {
      file["src"] = imageSources[index];
    }
  });

  return data;
};
const downloadImageAndGetSRC = async (filePath) => {
  console.log("Downloading image");
  try {
    const response = await axios.post(
      `${API_ENDPOINT}download/`,
      { path: filePath },
      { responseType: "blob" },
    );

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error downloading image:", error);
    return "";
  }
};

const changePathChildFolder = (newFolder) => {
  const newPath = moveToChildFolder(currentBrowsePath, newFolder);
  getRemoteFilesNFolders(newPath);
};

const showTextFile = (content) => {
  console.log(content);

  const textDisplayWrapper = document.createElement("div");
  const textDisplay = document.createElement("pre");
  textDisplayWrapper.classList =
    "p-5 rounded-lg overflow-scroll fixed top-1/2 left-2/4 z-30 bg-gray-100 w-4/5 h-4/5 overflow-hidden transform -translate-y-1/2 -translate-x-1/2";
  textDisplay.classList = "w-100 h-100";
  textDisplay.textContent = content;
  textDisplayWrapper.appendChild(textDisplay);
  document.body.appendChild(textDisplayWrapper);
  showBlurBackground(textDisplayWrapper);
};

const downloadTextFile = (filePath) => {
  axios
    .post(
      `${API_ENDPOINT}download/`,
      { path: filePath },
      { responseType: "text" },
    )
    .then((response) => {
      showTextFile(response.data);
    });
};

const executeCommand = (command) => {
  axios
    .post(
      `${API_ENDPOINT}execute/`,
      { command: command },
      { responseType: "text" },
    )
    .then((response) => {
      showTextFile(response.data);
    })
    .catch((err) => {
      console.log(err);
    });
};

const showBlurBackground = (popupElement) => {
  const blurElement = document.getElementById("blur-background");
  console.log(blurElement);
  blurElement.onclick = (e) => {
    if (popupElement && popupElement.parentNode) {
      popupElement.parentNode.removeChild(popupElement);
    }

    // Remove the blur background
    blurElement.classList.remove(
      "z-20",
      "bg-black",
      "opacity-50",
      "h-full",
      "w-full",
      "fixed",
      "transform",
      "scale-150",
    );
  };
  blurElement.classList =
    "z-20 bg-black opacity-50 h-full w-full fixed  transform scale-150";
};
const removeBlurBackground = () => {
  const blurElement = document.getElementById("blur-background");
  console.log(blurElement);
  blurElement.classList =
    "z-20 bg-black opacity-50 h-full w-full fixed hidden transform scale-150";
};
const displayImage = (blob) => {
  const imgParentElement = document.createElement("div");
  imgParentElement.classList = "bg-black";
  imgParentElement.innerHTML = `<i class="fa-regular fa-circle-xmark top-0 right-0 z-30 absolute"></i>`;
  const imgElement = document.createElement("img");
  imgElement.src = URL.createObjectURL(blob);
  //   imgElement.onclick = function () {
  //     this.display = "none";
  //   };
  imgElement.classList =
    "shadow-lg rounded-lg fixed top-1/2 left-2/4 z-30 h-auto max-h-full max-w-full py-5 transform -translate-y-1/2 -translate-x-1/2 ";
  // Append the image element to the body or a specific container
  imgParentElement.appendChild(imgElement);
  document.body.appendChild(imgParentElement);
  showBlurBackground(imgParentElement);
};

const downloadImageFile = (filePath) => {
  axios
    .post(
      `${API_ENDPOINT}download/`,
      { path: filePath },
      { responseType: "blob" }, // Use 'blob' to get a Blob object
    )
    .then((response) => {
      displayImage(response.data);
    })
    .catch((error) => {
      console.error("Error downloading image:", error);
    });
};

const displayVideo = (blob) => {
  const videoParentElement = document.createElement("div");
  videoParentElement.classList = "bg-black";
  videoParentElement.innerHTML = `<i class="fa-regular fa-circle-xmark top-0 right-0 z-30 absolute"></i>`;
  const videoElement = document.createElement("video");
  videoElement.src = URL.createObjectURL(blob);
  videoElement.controls = true;
  videoElement.autoplay = true;
  videoElement.classList =
    "shadow-lg rounded-lg fixed top-1/2 left-2/4 z-30 h-auto max-h-full max-w-full mt-1 mb-1 mx-5 transform -translate-y-1/2 -translate-x-1/2 ";
  videoParentElement.appendChild(videoElement);
  document.body.appendChild(videoParentElement);
  showBlurBackground(videoParentElement);
};

const downloadVideoFile = (filePath) => {
  axios
    .post(
      `${API_ENDPOINT}download/`,
      { path: filePath },
      { responseType: "blob" },
    )
    .then((response) => {
      displayVideo(response.data);
    })
    .catch((error) => {
      console.error("Error downloading video:", error);
    });
};
const displayAudio = (blob) => {
  console.log("Displaying Audio");
  const audioParentElement = document.createElement("div");
  audioParentElement.classList = "bg-black";
  audioParentElement.innerHTML = `<i class="fa-regular fa-circle-xmark top-0 right-0 z-30 absolute"></i>`;
  const audioElement = document.createElement("audio");
  audioElement.src = URL.createObjectURL(blob);
  audioElement.controls = true;
  audioElement.autoplay = true;
  audioElement.classList =
    "fixed top-1/2 left-2/4 z-30 h-40 max-h-full max-w-lg transform -translate-y-1/2 -translate-x-1/2 ";
  audioParentElement.appendChild(audioElement);
  document.body.appendChild(audioParentElement);
  showBlurBackground(audioParentElement);
};

const downloadAudioFile = (filePath) => {
  axios
    .post(
      `${API_ENDPOINT}download/`,
      { path: filePath },
      { responseType: "blob" },
    )
    .then((response) => {
      displayAudio(response.data);
    })
    .catch((error) => {
      console.error("Error downloading audio:", error);
    });
};

const downloadFile = (fileName, extension) => {
  console.log(extension);
  extension = extension.toLowerCase();
  const filePath = currentBrowsePath + "/" + fileName;

  if (TEXT_EXTENSIONS.includes(extension)) {
    downloadTextFile(filePath);
    return;
  } else if (IMAGE_EXTENSIONS.includes(extension)) {
    downloadImageFile(filePath);
    return;
  } else if (VIDEO_EXTENSIONS.includes(extension)) {
    downloadVideoFile(filePath);
    return;
  } else if (AUDIO_EXTENSIONS.includes(extension)) {
    downloadAudioFile(filePath);
    return;
  } else {
    forceDownloadFile();
  }
};

const getScreenshot = () => {
  axios
    .get(`${API_ENDPOINT}screenshot/`, { responseType: "arraybuffer" })
    .then((response) => {
      const blob = new Blob([response.data], { type: "image/png" });
      displayImage(blob);
    })
    .catch((error) => {
      console.error("Error downloading image:", error);
    });
};

const forceDownloadFile = (fileName, extension) => {
  const filePath = currentBrowsePath + "/" + fileName;
  axios
    .post(
      `${API_ENDPOINT}download/`,
      { path: filePath },
      { responseType: "blob" },
    )
    .then((response) => {
      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers["content-disposition"];
      const filenameMatch = contentDisposition
        ? contentDisposition.match(/filename="(.+)"/)
        : null;
      const filename = filenameMatch ? filenameMatch[1] : fileName;

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      // Create a download link and trigger a click to download the file
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    })
    .catch((error) => {
      console.error("Error downloading file:", error);
    });
};

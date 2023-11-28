let executeDialogCallback;
let DIALOG_KEY = "askeverytimedownload";

const folderParentElement = document.getElementById(
  "file-container-parent-content",
);
const helperParentElement = document.getElementById("helper-bar");
console.log(folderParentElement);
const renderFileFetchResponse = (path, data) => {
  //Checking if it is folder or volumes
  if ("volumes" in data) {
    renderHelperBar("ROOT:");
    renderVolumes(data["volumes"]);
  } else {
    renderHelperBar(path);
    renderedFilesNFolders(data);
  }
};

const renderVolumes = (volumes) => {
  let childElement = `<ul role="list" class="mx-auto py-6 mt-6">`;
  for (let volume of volumes) {
    childElement += `<li class="px-3 mx-auto w-4/5 flex py-3 mt-3 first:pt-3 last:pb-3 bg-slate-50 rounded-md shadow-sm hover:bg-black hover:text-white transform hover:scale-x-105 hover:text-lg transition-all ease-in-out delay-50 duration-150 cursor-pointer border border-black" onclick="changePathChildFolder('${volume}')">${volume}</li>`;
  }
  childElement += "</ul>";
  folderParentElement.innerHTML = childElement;
};

const renderHelperBar = (path) => {
  helperParentElement.innerHTML = `<div class="top-0 fixed w-full z-20 flex justify-between py-3 px-5 text-lg bg-black text-white"><div class="">${path}</div><div class=""><i onclick="renderShellInput()" class="fa-solid fa-terminal"></i><i onclick="getScreenshot()" class="cursor-pointer fa-solid fa-camera mx-5"></i><i class="fa-solid fa-table"></i><i onclick="goBackPath()" class="mx-5 cursor-pointer fa-sharp fa-solid fa-turn-up fa-lg"></i></div></div>`;
};
const renderShellInput = () => {
  const dialog = document.createElement("div");
  executeDialogCallback = () => {
    const command = document.getElementById("shell-input").value;
    console.log("Sending:", command);
    executeCommand(command);
  };
  dialog.classList =
    "z-30 shadow-lg fixed top-1/2 flex flex-col rounded-sm items-center justify-evenly left-1/2 transform -translate-y-1/2 -translate-x-1/2 border border-black text-slate-400 w-96 h-60 bg-white";

  dialog.innerHTML = `
    <input class="px-2 py-1 mx-5 h-10 w-3/4 border-2 rounded-md border-black text-black text-sm mx-auto" type="text" id="shell-input" placeholder="echo hello world"/>
    <div class="flex items-center justify-center">
    <div class="flex justify-center align-center gap-6">
      <button onclick="removeDialog(this)" class="h-10 w-24 bg-white border border-black hover:scale-105 text-black text-lg">Return</button>
      <button onclick="executeDialogCallback(this)" class="h-10 w-24 bg-black text-white text-lg hover:scale-105">Execute</button>
    </div>
  `;

  document.body.appendChild(dialog);
  showBlurBackground(dialog);
};
const renderBackButton = () => {
  return `<i onclick="goBackPath()" class="fa-solid fa-arrow-left-long fa-lg mt-3 mx-auto px-3 flex w-4/5 mb-6 cursor-pointer"></i>`;
};
const saveDialogOptionLocalStorage = (status) => {
  localStorage.setItem(DIALOG_KEY, status);
};
const renderDialog = (infoText, callback, ...params) => {
  console.log(callback);
  console.log(params);
  const dialog = document.createElement("div");
  executeDialogCallback = (elem) => {
    console.log("Start Download Please!");
    const downloadCheckBox = document.getElementById("download-checkbox");
    saveDialogOptionLocalStorage(downloadCheckBox.checked);
    callback(...params);
    removeDialog(elem);
  };
  dialog.classList =
    "z-30 shadow-lg fixed top-1/2 flex flex-col rounded-sm items-center justify-evenly left-1/2 transform -translate-y-1/2 -translate-x-1/2 border border-black text-slate-400 w-96 h-60 bg-white";

  dialog.innerHTML = `
    <div class="mx-auto text-center text-black text-2xl decoration-solid">${infoText}</div>
		<div class="flex flex-col items-center justify-center">
			<div class="flex items-center justify-center mb-3">
				<input type="checkbox" id="download-checkbox" class="mr-1  accent-black-500/25"> <div class="text-slate-600 place-self-center text-md"
				>Don't Ask Again</div>
			</div>
			<div class="flex justify-center align-center gap-6">
			  <button onclick="removeDialog(this)" class="h-10 w-24 bg-white border border-black hover:scale-105 text-black text-lg">No</button>
			  <button onclick="executeDialogCallback(this)" class="h-10 w-24 bg-black text-white text-lg hover:scale-105">Yes</button>
			</div>
		</div>
	</div>
  `;

  document.body.appendChild(dialog);
  showBlurBackground(dialog);
};
const removeDialog = (buttonElement) => {
  const dialog = buttonElement.closest(".z-30");
  console.log("Removing this dialog");
  console.log(dialog);

  if (dialog && dialog.parentNode) {
    dialog.parentNode.removeChild(dialog);
  }
  removeBlurBackground();
};
const renderedFilesNFolders = async (data) => {
  let childElement = `<ul role="list" class="mx-auto py-6">`;
  childElement += `<li>${renderBackButton()}</li>`;

  if ("folders" in data) {
    for (let folder of data["folders"]) {
      childElement += `<li class="px-3 my-2 mx-auto w-4/5 flex py-3 first:pt-3 last:pb-3 bg-slate-50 rounded-md shadow-sm hover:bg-black hover:text-white transform hover:scale-x-105 hover:text-lg transition-all ease-in-out delay-50 duration-150 cursor-pointer border border-black" onclick="changePathChildFolder('${folder.name}')"><i class="ml-2 mr-2 place-self-center fa-regular fa-folder"></i>${folder.name}</li>`;
    }
  }
  let imgID = 1;
  if ("files" in data) {
    for (let file of data["files"]) {
      const uniqueKey = `img-${imgID++}`;
      file["key"] = uniqueKey;
      childElement += `<li class="group px-3 mx-auto w-4/5 flex items-center justify-between py-3 first:pt-3 border-t first:border-t-0 last:pb-3 hover:bg-slate-50 hover:border-b text-wrap-none overflow-hidden hover:border-t hover:border-black transform transition-all ease-in-out duration-50 cursor-pointer" onclick="downloadFile('${
        file.name
      }', '${
        file.file_extension
      }')"><div class="flex items-center"><div class="mr-4">${await renderIconByExtension(
        file,
      )}</div><div class="">${
        file.name
      }</div> </div><div class="ml-4 float-right invisible group-hover:visible place-self-center py-1 px-2 rounded-sm bg-black text-white" onclick="handleDownloadClick(event, '${
        file.name
      }', '${
        file.file_extension
      }')"><i class="bg-black fa-solid fa-download"></i></div></li>`;
    }
  }
  childElement += "</ul>";
  folderParentElement.innerHTML = childElement;
  await resolveImageRequests();
};
const resolveImageRequests = async () => {
  for (imageRequest of imageRequests) {
    const key = imageRequest[0];
    const path = imageRequest[1];
    const newSrc = await downloadImageAndGetSRC(path);
    const img = document.getElementById(key);
    img.src = newSrc;
  }
  imageRequests = [];
};

let imageRequests = [];
const renderIconByExtension = async (file) => {
  const extension = file.file_extension.toLowerCase();
  let src = "";
  if (IMAGE_EXTENSIONS.includes(extension)) {
    imageRequests.push([file["key"], file["full_path"]]);
  }
  switch (extension) {
    case ".pdf":
      return `<i class="ml-2 mr-4 place-self-center fa-regular fa-file-pdf"></i>`;
    case ".mp3":
    case ".ogg":
    case ".wav":
      return `<i class="ml-2 mr-4 place-self-center fa-solid fa-file-audio"></i>`;
    case ".webm":
    case ".mp4":
      return `<i class="ml-2 mr-4 place-self-center fa-solid fa-file-video"></i>`;
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
      return `<img id="${file["key"]}" class="object-cover object-center h-16 w-16" src="${src}"/>`;
    default:
      return `<i class="ml-2 mr-4 place-self-center fa-regular fa-file"></i>`;
  }
};

const handleDownloadClick = (event, fileName, fileExtension) => {
  event.stopPropagation(); // Prevent event propagation
  const dontRenderDialog = localStorage.getItem(DIALOG_KEY);
  console.log(typeof dontRenderDialog);
  if (dontRenderDialog !== null || dontRenderDialog !== "true") {
    renderDialog(
      "Download this file?",
      forceDownloadFile,
      fileName,
      fileExtension,
    );
  } else {
    // Don't need to think about anything
    // Just callback with the params
    forceDownloadFile(fileName, fileExtension);
  }
};

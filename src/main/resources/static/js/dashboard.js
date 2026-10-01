// ======================================================
// AUTHENTICATION
// ======================================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ======================================================
// DOM ELEMENTS
// ======================================================

const fileList =
    document.getElementById("fileList");

const uploadBtn =
    document.getElementById("uploadBtn");

const fileInput =
    document.getElementById("fileInput");

const uploadMessage =
    document.getElementById("uploadMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

const searchInput =
    document.getElementById("searchInput");

const sortSelect =
    document.getElementById("sortSelect");

const deleteModal =
    document.getElementById("deleteModal");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");

// ======================================================
// FILE DATA
// ======================================================

// Store all files returned by backend
let allFiles = [];

async function loadFiles() {

    try {

        fileList.innerHTML =
            `<div class="loading">Loading files...</div>`;

        console.log("Loading files...");

        const controller =
            new AbortController();

        const timeout =
            setTimeout(function () {
                controller.abort();
            }, 10000);


        const response =
            await fetch(
                "http://localhost:8081/api/files",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    },

                    signal: controller.signal
                }
            );


        clearTimeout(timeout);

        console.log(
            "GET /api/files status:",
            response.status
        );


        if (response.status === 401) {

            localStorage.removeItem("token");

            window.location.href =
                "login.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to load files. Status: "
                + response.status
            );
        }


        const files =
            await response.json();

        console.log(
            "Files received:",
            files
        );


        // Store files for search and sort
        allFiles = files;


        // Display files
        updateFileList();


    } catch (error) {

        console.error(
            "LOAD FILES ERROR:",
            error
        );


        if (error.name === "AbortError") {

            fileList.innerHTML =
                "<p>Server took too long to respond.</p>";

        } else {

            fileList.innerHTML =
                "<p>Unable to load files.</p>";
        }

    }
}

// ======================================================
// UPDATE STATISTICS
// ======================================================

function updateStatistics(files) {

    const totalFiles =
        document.getElementById(
            "totalFiles"
        );

    const storageUsed =
        document.getElementById(
            "storageUsed"
        );


    // Total number of files
    totalFiles.textContent =
        files.length;


    // Calculate total storage
    const totalBytes =
        files.reduce(
            function (total, file) {

                return total +
                    (file.fileSize || 0);

            },
            0
        );


    storageUsed.textContent =
        formatFileSize(totalBytes);
}


// ======================================================
// DISPLAY FILES
// ======================================================

function displayFiles(files) {

    fileList.innerHTML = "";


    // ------------------------------------------
    // NO FILES
    // ------------------------------------------

    if (files.length === 0) {

        fileList.innerHTML =
            "<p>No files found.</p>";

        return;
    }


    // ------------------------------------------
    // DISPLAY EVERY FILE
    // ------------------------------------------

    files.forEach(function (file) {

        const fileCard =
            document.createElement("div");


        fileCard.className =
            "file-card";


        fileCard.innerHTML = `

            <div class="file-info">

                <div class="file-icon">
                    📄
                </div>

                <div>

                    <h3>
                        ${file.fileName}
                    </h3>

                    <p>
                        ${formatFileSize(file.fileSize)}
                        •
                        ${formatDate(file.uploadedAt)}
                    </p>

                </div>

            </div>


            <div class="file-actions">

                <button
                    class="download-btn"
                    onclick="downloadFile(
                        ${file.id},
                        '${escapeFileName(file.fileName)}'
                    )">

                    ↓ Download

                </button>


                <button
                    class="rename-btn"
                    onclick="renameFile(${file.id})">

                    ✏ Rename

                </button>


                <button
                    class="delete-btn"
                    onclick="deleteFile(${file.id})">

                    🗑 Delete

                </button>

            </div>

        `;


        fileList.appendChild(
            fileCard
        );

    });
}


// ======================================================
// ESCAPE FILE NAME
// ======================================================

function escapeFileName(fileName) {

    return fileName
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


// ======================================================
// FORMAT FILE SIZE
// ======================================================

function formatFileSize(bytes) {

    if (!bytes || bytes === 0) {
        return "0 B";
    }


    if (bytes < 1024) {

        return bytes + " B";
    }


    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1)
            + " KB"
        );
    }


    if (bytes < 1024 * 1024 * 1024) {

        return (
            (bytes / (1024 * 1024)).toFixed(1)
            + " MB"
        );
    }


    return (
        (bytes / (1024 * 1024 * 1024)).toFixed(1)
        + " GB"
    );
}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);


    return date.toLocaleDateString();
}


// ======================================================
// UPLOAD
// ======================================================

uploadBtn.addEventListener(
    "click",
    function () {

        fileInput.click();

    }
);


fileInput.addEventListener(
    "change",
    async function () {

        const file =
            fileInput.files[0];


        if (!file) {
            return;
        }


        const formData =
            new FormData();


        formData.append(
            "file",
            file
        );


        uploadMessage.textContent =
            "Uploading...";


        try {

            const response =
                await fetch(
                    "http://localhost:8081/api/files/upload",
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                "Bearer " + token
                        },

                        body: formData
                    }
                );


            const result =
                await response.text();


            if (!response.ok) {

                uploadMessage.textContent =
                    "Upload failed: " + result;

                return;
            }


            uploadMessage.textContent =
                "File uploaded successfully!";


            fileInput.value = "";


            // Reload files
            loadFiles();


        } catch (error) {

            console.error(
                "UPLOAD ERROR:",
                error
            );

            uploadMessage.textContent =
                "Upload failed.";
        }

    }
);


// ======================================================
// DOWNLOAD
// ======================================================

async function downloadFile(
    id,
    fileName
) {

    try {

        const response =
            await fetch(
                `http://localhost:8081/api/files/${id}/download`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        if (!response.ok) {

            alert(
                "Download failed."
            );

            return;
        }


        // Convert response to file
        const blob =
            await response.blob();


        // Create temporary URL
        const url =
            window.URL.createObjectURL(
                blob
            );


        // Create download link
        const a =
            document.createElement("a");


        a.href = url;


        // Keep original filename
        a.download =
            fileName || "download";


        document.body.appendChild(a);


        a.click();


        a.remove();


        // Remove temporary URL
        window.URL.revokeObjectURL(
            url
        );


    } catch (error) {

        console.error(
            "DOWNLOAD ERROR:",
            error
        );

        alert(
            "Download failed."
        );
    }
}


// ======================================================
// RENAME
// ======================================================

async function renameFile(id) {

    const newFileName =
        prompt(
            "Enter new file name:"
        );


    if (!newFileName) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:8081/api/files/${id}/rename`,
                {
                    method: "PUT",

                    headers: {

                        "Authorization":
                            "Bearer " + token,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        newFileName:
                        newFileName
                    })
                }
            );


        const result =
            await response.text();


        // ------------------------------------------
        // RENAME ERROR
        // ------------------------------------------

        if (!response.ok) {

            if (
                response.status === 400 &&
                result.includes(
                    "KeyAlreadyExists"
                )
            ) {

                uploadMessage.textContent =
                    "A file with this name already exists.";

            } else {

                uploadMessage.textContent =
                    "Rename failed: " +
                    result;
            }

            return;
        }


        // ------------------------------------------
        // SUCCESS
        // ------------------------------------------

        uploadMessage.textContent =
            "File renamed successfully!";


        loadFiles();


    } catch (error) {

        console.error(
            "RENAME ERROR:",
            error
        );

        uploadMessage.textContent =
            "Rename failed.";
    }
}

// ======================================================
// DELETE
// ======================================================

async function deleteFile(id) {

    console.log("DELETE CLICKED:", id);

    const confirmed =
        await showDeleteModal();

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `http://localhost:8081/api/files/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const result =
            await response.text();

        console.log("DELETE RESPONSE:", result);

        if (!response.ok) {

            alert(result);

            return;
        }

        uploadMessage.textContent =
            "File deleted successfully!";

        loadFiles();

    } catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );

        alert("Delete failed.");
    }
}


// ======================================================
// DELETE MODAL
// ======================================================

function showDeleteModal() {

    return new Promise(function (resolve) {

        deleteModal.classList.add("show");


        cancelDeleteBtn.onclick = function () {

            deleteModal.classList.remove("show");

            resolve(false);
        };


        confirmDeleteBtn.onclick = function () {

            deleteModal.classList.remove("show");

            resolve(true);
        };

    });
}
function updateFileList()
{

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const sortType =
        sortSelect.value;


    // ------------------------------------------
    // SEARCH
    // ------------------------------------------

    let filteredFiles =
        allFiles.filter(function (file) {

            return file.fileName
                .toLowerCase()
                .includes(searchText);

        });


    // ------------------------------------------
    // SORT
    // ------------------------------------------

    if (sortType === "newest") {

        filteredFiles.sort(
            function (a, b) {

                return new Date(b.uploadedAt)
                    - new Date(a.uploadedAt);

            }
        );

    }


    else if (sortType === "oldest") {

        filteredFiles.sort(
            function (a, b) {

                return new Date(a.uploadedAt)
                    - new Date(b.uploadedAt);

            }
        );

    }


    else if (sortType === "nameAsc") {

        filteredFiles.sort(
            function (a, b) {

                return a.fileName
                    .localeCompare(
                        b.fileName
                    );

            }
        );

    }


    else if (sortType === "nameDesc") {

        filteredFiles.sort(
            function (a, b) {

                return b.fileName
                    .localeCompare(
                        a.fileName
                    );

            }
        );

    }


    else if (sortType === "largest") {

        filteredFiles.sort(
            function (a, b) {

                return (
                    (b.fileSize || 0)
                    -
                    (a.fileSize || 0)
                );

            }
        );

    }


    else if (sortType === "smallest") {

        filteredFiles.sort(
            function (a, b) {

                return (
                    (a.fileSize || 0)
                    -
                    (b.fileSize || 0)
                );

            }
        );

    }


    // ------------------------------------------
    // DISPLAY RESULT
    // ------------------------------------------

    displayFiles(filteredFiles);
}


// Search when typing
searchInput.addEventListener(
    "input",
    function () {

        updateFileList();

    }
);


// Sort when dropdown changes
sortSelect.addEventListener(
    "change",
    function () {

        updateFileList();

    }
);


// ======================================================
// SIDEBAR NAVIGATION
// ======================================================

const dashboardNav =
    document.getElementById(
        "dashboardNav"
    );


const myFilesNav =
    document.getElementById(
        "myFilesNav"
    );


const favoritesNav =
    document.getElementById(
        "favoritesNav"
    );


const trashNav =
    document.getElementById(
        "trashNav"
    );


const dashboardSection =
    document.getElementById(
        "dashboardSection"
    );


const myFilesSection =
    document.getElementById(
        "myFilesSection"
    );


// ======================================================
// DASHBOARD NAVIGATION
// ======================================================

dashboardNav.addEventListener(
    "click",
    function (event) {

        event.preventDefault();


        dashboardSection.scrollIntoView({
            behavior: "smooth"
        });


        setActiveNav(
            dashboardNav
        );

    }
);


// ======================================================
// MY FILES NAVIGATION
// ======================================================

myFilesNav.addEventListener(
    "click",
    function (event) {

        event.preventDefault();


        myFilesSection.scrollIntoView({
            behavior: "smooth"
        });


        setActiveNav(
            myFilesNav
        );

    }
);


// ======================================================
// FAVORITES
// ======================================================

favoritesNav.addEventListener(
    "click",
    function (event) {

        event.preventDefault();


        alert(
            "Favorites feature will be added next."
        );


        setActiveNav(
            favoritesNav
        );

    }
);


// ======================================================
// TRASH
// ======================================================

trashNav.addEventListener(
    "click",
    function (event) {

        event.preventDefault();


        alert(
            "Trash feature will be added next."
        );


        setActiveNav(
            trashNav
        );

    }
);


// ======================================================
// ACTIVE NAVIGATION
// ======================================================

function setActiveNav(
    activeItem
) {

    const navItems =
        document.querySelectorAll(
            ".sidebar-nav .nav-item"
        );


    navItems.forEach(
        function (item) {

            item.classList.remove(
                "active"
            );

        }
    );


    activeItem.classList.add(
        "active"
    );
}


// ======================================================
// LOGOUT
// ======================================================

logoutBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "token"
        );


        window.location.href =
            "login.html";

    }
);
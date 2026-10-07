// =====================================================
// CONFIGURATION
// =====================================================

const API_BASE_URL = "/api";


// =====================================================
// AUTHENTICATION
// =====================================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// =====================================================
// DOM ELEMENTS
// =====================================================

const fileList = document.getElementById("fileList");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const uploadMessage = document.getElementById("uploadMessage");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchInput");

const totalFilesElement =
    document.getElementById("totalFiles");

const storageUsedElement =
    document.getElementById("storageUsed");


// =====================================================
// INITIALIZE DASHBOARD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Dashboard initialized");

    loadFiles();

    setupUpload();

    setupSearch();

    setupNavigation();

    setupLogout();

});


// =====================================================
// LOAD FILES
// =====================================================

async function loadFiles() {

    if (!fileList) {
        console.error("fileList not found!");
        return;
    }

    fileList.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading files...</p>
        </div>
    `;

    try {

        console.log(
            "Calling:",
            `${API_BASE_URL}/files`
        );

        const response = await fetch(
            `${API_BASE_URL}/files`,
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        console.log(
            "Response:",
            response.status
        );


        // JWT expired / invalid
        if (response.status === 401) {

            localStorage.removeItem("token");

            window.location.href = "login.html";

            return;
        }


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                "Server returned " +
                response.status +
                ": " +
                errorText
            );
        }


        const files =
            await response.json();

        console.log(
            "Files received:",
            files
        );


        displayFiles(files);


    } catch (error) {

        console.error(
            "LOAD FILES ERROR:",
            error
        );

        fileList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load files
                </h3>

                <p>
                    Please check whether the server is running.
                </p>

                <button onclick="loadFiles()">
                    Retry
                </button>

            </div>
        `;
    }
}


// =====================================================
// DISPLAY FILES
// =====================================================

function displayFiles(files) {

    if (!fileList) {
        return;
    }

    fileList.innerHTML = "";


    // =================================================
    // TOTAL FILES
    // =================================================

    if (totalFilesElement) {

        totalFilesElement.textContent =
            files.length;
    }


    // =================================================
    // STORAGE USED
    // =================================================

    const totalBytes = files.reduce(
        function (total, file) {

            return total +
                (file.fileSize || 0);

        },
        0
    );


    if (storageUsedElement) {

        storageUsedElement.textContent =
            formatFileSize(totalBytes);
    }


    // =================================================
    // FILE TYPE COUNTS
    // =================================================

    updateFileTypeCounts(files);


    // =================================================
    // NO FILES
    // =================================================

    if (files.length === 0) {

        fileList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📂
                </div>

                <h3>
                    No files yet
                </h3>

                <p>
                    Upload your first file to get started.
                </p>

                <button
                    type="button"
                    onclick="document.getElementById('fileInput').click()">

                    Upload File

                </button>

            </div>
        `;

        return;
    }


    // =================================================
    // DISPLAY FILES
    // =================================================

    files.forEach(function (file) {

        const fileCard =
            document.createElement("div");

        fileCard.className =
            "file-card";


        fileCard.innerHTML = `

            <div class="file-info">

                <div class="file-icon">
                    ${getFileIcon(file.fileName)}
                </div>

                <div>

                    <h3>
                        ${escapeHtml(file.fileName)}
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


        fileList.appendChild(fileCard);

    });
}


// =====================================================
// FILE TYPE COUNTS
// =====================================================

function updateFileTypeCounts(files) {

    let documents = 0;
    let images = 0;
    let videos = 0;
    let other = 0;


    files.forEach(function (file) {

        const name =
            (file.fileName || "")
                .toLowerCase();


        if (
            name.endsWith(".pdf") ||
            name.endsWith(".doc") ||
            name.endsWith(".docx") ||
            name.endsWith(".txt") ||
            name.endsWith(".xls") ||
            name.endsWith(".xlsx") ||
            name.endsWith(".ppt") ||
            name.endsWith(".pptx") ||
            name.endsWith(".sql")
        ) {

            documents++;

        } else if (
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg") ||
            name.endsWith(".png") ||
            name.endsWith(".gif") ||
            name.endsWith(".webp")
        ) {

            images++;

        } else if (
            name.endsWith(".mp4") ||
            name.endsWith(".avi") ||
            name.endsWith(".mkv") ||
            name.endsWith(".mov")
        ) {

            videos++;

        } else {

            other++;
        }

    });


    const documentCount =
        document.getElementById("documentCount");

    const imageCount =
        document.getElementById("imageCount");

    const videoCount =
        document.getElementById("videoCount");

    const otherCount =
        document.getElementById("otherCount");


    if (documentCount) {
        documentCount.textContent =
            documents + " files";
    }

    if (imageCount) {
        imageCount.textContent =
            images + " files";
    }

    if (videoCount) {
        videoCount.textContent =
            videos + " files";
    }

    if (otherCount) {
        otherCount.textContent =
            other + " files";
    }
}


// =====================================================
// FILE ICON
// =====================================================

function getFileIcon(fileName) {

    const name =
        (fileName || "").toLowerCase();


    if (
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".gif") ||
        name.endsWith(".webp")
    ) {

        return "🖼️";
    }


    if (
        name.endsWith(".mp4") ||
        name.endsWith(".avi") ||
        name.endsWith(".mkv") ||
        name.endsWith(".mov")
    ) {

        return "🎬";
    }


    if (
        name.endsWith(".zip") ||
        name.endsWith(".rar") ||
        name.endsWith(".7z")
    ) {

        return "📦";
    }


    return "📄";
}


// =====================================================
// FILE SIZE
// =====================================================

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


// =====================================================
// DATE
// =====================================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    return new Date(dateString)
        .toLocaleDateString();
}


// =====================================================
// UPLOAD
// =====================================================

function setupUpload() {

    const uploadBtn =
        document.getElementById("uploadBtn");

    const quickUploadBtn =
        document.getElementById("quickUploadBtn");

    const fileInput =
        document.getElementById("fileInput");

    const uploadMessage =
        document.getElementById("uploadMessage");


    if (!fileInput) {

        console.error(
            "fileInput not found!"
        );

        return;
    }


    // =================================================
    // PREVENT DUPLICATE EVENT LISTENERS
    // =================================================

    if (
        fileInput.dataset.uploadSetup === "true"
    ) {

        console.log(
            "Upload already initialized"
        );

        return;
    }


    fileInput.dataset.uploadSetup = "true";


    // =================================================
    // TOP UPLOAD BUTTON
    // =================================================

    if (uploadBtn) {

        uploadBtn.addEventListener(
            "click",
            function () {

                console.log(
                    "Upload button clicked"
                );

                fileInput.click();

            }
        );

    }


    // =================================================
    // QUICK UPLOAD BUTTON
    // =================================================

    if (quickUploadBtn) {

        quickUploadBtn.addEventListener(
            "click",
            function () {

                console.log(
                    "Quick upload clicked"
                );

                fileInput.click();

            }
        );

    }


    // =================================================
    // FILE SELECTED
    // =================================================

    fileInput.addEventListener(
        "change",
        async function () {

            const file =
                fileInput.files[0];


            if (!file) {
                return;
            }


            console.log(
                "Selected file:",
                file.name
            );


            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            if (uploadMessage) {

                uploadMessage.textContent =
                    "Uploading " +
                    file.name +
                    "...";

            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/files/upload`,
                        {
                            method: "POST",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            },

                            body: formData
                        }
                    );


                console.log(
                    "Upload status:",
                    response.status
                );


                const result =
                    await response.text();


                console.log(
                    "Upload response:",
                    result
                );


                if (!response.ok) {

                    throw new Error(
                        result ||
                        "Upload failed"
                    );
                }


                if (uploadMessage) {

                    uploadMessage.textContent =
                        "✓ File uploaded successfully!";

                }


                // Clear selected file
                fileInput.value = "";


                // Refresh files
                await loadFiles();


            } catch (error) {

                console.error(
                    "UPLOAD ERROR:",
                    error
                );


                if (uploadMessage) {

                    uploadMessage.textContent =
                        "❌ Upload failed: " +
                        error.message;

                }

            }

        }
    );
}


// =====================================================
// DOWNLOAD
// =====================================================

async function downloadFile(
    id,
    fileName
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/files/${id}/download`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        if (response.status === 401) {

            localStorage.removeItem("token");

            window.location.href =
                "login.html";

            return;
        }


        if (!response.ok) {

            alert(
                "Download failed."
            );

            return;
        }


        const blob =
            await response.blob();


        const url =
            window.URL.createObjectURL(blob);


        const a =
            document.createElement("a");


        a.href = url;

        a.download =
            fileName || "download";


        document.body.appendChild(a);

        a.click();

        a.remove();


        window.URL.revokeObjectURL(url);


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


// =====================================================
// RENAME
// =====================================================

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
                `${API_BASE_URL}/files/${id}/rename`,
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


        if (!response.ok) {

            alert(result);

            return;
        }


        alert(
            "File renamed successfully!"
        );


        await loadFiles();


    } catch (error) {

        console.error(
            "RENAME ERROR:",
            error
        );

        alert(
            "Rename failed."
        );
    }
}


// =====================================================
// DELETE
// =====================================================

async function deleteFile(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this file?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/files/${id}`,
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


        if (!response.ok) {

            alert(result);

            return;
        }


        alert(
            "File deleted successfully!"
        );


        await loadFiles();


    } catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );

        alert(
            "Delete failed."
        );
    }
}


// =====================================================
// SEARCH
// =====================================================

function setupSearch() {

    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function () {

            const searchText =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const fileCards =
                document.querySelectorAll(
                    ".file-card"
                );


            fileCards.forEach(
                function (card) {

                    const heading =
                        card.querySelector("h3");


                    if (!heading) {
                        return;
                    }


                    const fileName =
                        heading.textContent
                            .toLowerCase();


                    card.style.display =
                        fileName.includes(searchText)
                            ? "flex"
                            : "none";

                }
            );

        }
    );
}


// =====================================================
// SORT
// =====================================================

function setupSort() {

    const sortSelect =
        document.getElementById("sortSelect");


    if (!sortSelect) {
        return;
    }


    sortSelect.addEventListener(
        "change",
        async function () {

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/files`,
                        {
                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );


                if (!response.ok) {
                    return;
                }


                let files =
                    await response.json();


                const sortValue =
                    sortSelect.value;


                if (sortValue === "newest") {

                    files.sort(
                        (a, b) =>
                            new Date(b.uploadedAt) -
                            new Date(a.uploadedAt)
                    );

                } else if (sortValue === "oldest") {

                    files.sort(
                        (a, b) =>
                            new Date(a.uploadedAt) -
                            new Date(b.uploadedAt)
                    );

                } else if (sortValue === "name") {

                    files.sort(
                        (a, b) =>
                            a.fileName
                                .localeCompare(
                                    b.fileName
                                )
                    );

                } else if (sortValue === "size") {

                    files.sort(
                        (a, b) =>
                            (b.fileSize || 0) -
                            (a.fileSize || 0)
                    );
                }


                displayFiles(files);


            } catch (error) {

                console.error(
                    "SORT ERROR:",
                    error
                );
            }

        }
    );
}


// =====================================================
// SIDEBAR NAVIGATION
// =====================================================

function setupNavigation() {

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


    // Dashboard
    if (dashboardNav) {

        dashboardNav.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                if (dashboardSection) {

                    dashboardSection.scrollIntoView({
                        behavior: "smooth"
                    });
                }


                setActiveNav(
                    dashboardNav
                );

            }
        );
    }


    // My Files
    if (myFilesNav) {

        myFilesNav.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const filesSection =
                    document.getElementById(
                        "files"
                    );


                if (myFilesSection) {

                    myFilesSection.scrollIntoView({
                        behavior: "smooth"
                    });

                } else if (filesSection) {

                    filesSection.scrollIntoView({
                        behavior: "smooth"
                    });
                }


                setActiveNav(
                    myFilesNav
                );

            }
        );
    }


    // Favorites
    if (favoritesNav) {

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
    }


    // Trash
    if (trashNav) {

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
    }
}


// =====================================================
// ACTIVE NAVIGATION
// =====================================================

function setActiveNav(activeItem) {

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


    if (activeItem) {

        activeItem.classList.add(
            "active"
        );
    }
}


// =====================================================
// LOGOUT
// =====================================================

function setupLogout() {

    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            localStorage.removeItem(
                "token"
            );

            window.location.href =
                "login.html";

        }
    );
}


// =====================================================
// SECURITY HELPERS
// =====================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text || "";


    return div.innerHTML;
}


function escapeFileName(name) {

    return String(name || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


// =====================================================
// START SORT
// =====================================================

setupSort();
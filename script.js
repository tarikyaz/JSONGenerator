document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('titleInput');
    const contentInput = document.getElementById('contentInput');
    const titleCharCount = document.getElementById('titleCharCount');
    const contentCharCount = document.getElementById('contentCharCount');
    const totalContentChars = document.getElementById('totalContentChars');
    const fileSizeElem = document.getElementById('fileSize');
    const warningsElem = document.getElementById('warnings');
    const downloadButton = document.getElementById('downloadButton');
    const addEntryButton = document.getElementById('addEntryButton');
    const jsonTable = document.getElementById('jsonTable').getElementsByTagName('tbody')[0];
    const fileInput = document.getElementById('fileInput');
    let jsonData = [];

    function updateCharCounts() {
        const titleLength = titleInput.value.length;
        const contentLength = contentInput.value.length;
        titleCharCount.textContent = `Title: ${titleLength}/25`;
        contentCharCount.textContent = `Content: ${contentLength}/150`;
        updateTotalContentChars();
        updateFileSize();
    }

    function updateTotalContentChars() {
        const totalChars = jsonData.reduce((total, entry) => total + entry.Title.length + entry.Content.length, 0);
        totalContentChars.textContent = totalChars;
    }

    function updateFileSize() {
        const jsonString = JSON.stringify(jsonData,0,0);
        const fileSize = new Blob([jsonString]).size;
        fileSizeElem.textContent = fileSize;
        return fileSize;
    }

    function checkFileSize() {
        const fileSize = updateFileSize();
        const fileSizeLimit = 5000;

        if (fileSize > fileSizeLimit) {
            downloadButton.disabled = true;
            addEntryButton.disabled = true;
            displayWarning(`File size exceeds 5 KB (${fileSize} bytes)`);
        } else {
            downloadButton.disabled = false;
            addEntryButton.disabled = false;
        }
    }

    function displayWarning(message) {
        const warningMessage = document.createElement("div");
        warningMessage.className = "warning-message";
        warningMessage.textContent = message;
        warningsElem.appendChild(warningMessage);

        setTimeout(() => {
            warningMessage.style.opacity = 0;
            setTimeout(() => {
                warningsElem.removeChild(warningMessage);
            }, 500); // Wait for fade-out animation to complete before removal
        }, 3000); // Warning stays visible for 3 seconds
    }

    function addEntry() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (content === "") {
            displayWarning("Content cannot be empty.");
            return;
        }

        const entry = { Title: title, Content: content };
        jsonData.push(entry);
        updateTable();
        clearInputs();
        updateCharCounts();
        checkFileSize();
    }

    function clearInputs() {
        titleInput.value = "";
        contentInput.value = "";
        titleCharCount.textContent = "Title: 0/25";
        contentCharCount.textContent = "Content: 0/150";
    }

    function updateTable() {
        jsonTable.innerHTML = "";
        jsonData.forEach((entry, index) => {
            const row = jsonTable.insertRow();
            const titleCell = row.insertCell(0);
            const contentCell = row.insertCell(1);
            const titleCountCell = row.insertCell(2);
            const contentCountCell = row.insertCell(3);
            const actionsCell = row.insertCell(4);

            titleCell.textContent = entry.Title;
            contentCell.textContent = entry.Content;
            titleCountCell.textContent = entry.Title.length;
            contentCountCell.textContent = entry.Content.length;

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = () => editEntry(index);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteEntry(index);

            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);
        });
    }

    function editEntry(index) {
        const entry = jsonData[index];
        titleInput.value = entry.Title;
        contentInput.value = entry.Content;

        addEntryButton.textContent = "Save Changes";
        addEntryButton.onclick = () => saveEntry(index);
    }

    function saveEntry(index) {
        const updatedTitle = titleInput.value.trim();
        const updatedContent = contentInput.value.trim();

        if (updatedContent === "") {
            displayWarning("Content cannot be empty.");
            return;
        }

        jsonData[index].Title = updatedTitle;
        jsonData[index].Content = updatedContent;

        addEntryButton.textContent = "Add Entry";
        addEntryButton.onclick = addEntry;

        clearInputs();
        updateTable();
        updateCharCounts();
        checkFileSize();
    }

    function deleteEntry(index) {
        jsonData.splice(index, 1);
        updateTable();
        updateCharCounts();
        checkFileSize();
    }

    function downloadJsonFile() {
        const jsonString = JSON.stringify(jsonData, 0, 0);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    titleInput.addEventListener("input", updateCharCounts);
    contentInput.addEventListener("input", updateCharCounts);
    addEntryButton.addEventListener("click", addEntry);
    downloadButton.addEventListener("click", downloadJsonFile);

    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            jsonData = JSON.parse(e.target.result);
            updateTable();
            updateCharCounts();
            checkFileSize();
        };
        reader.readAsText(file);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('titleInput');
    const contentInput = document.getElementById('contentInput');
    const titleCharCount = document.getElementById('titleCharCount');
    const contentCharCount = document.getElementById('contentCharCount');
    const totalContentChars = document.getElementById('totalContentChars');
    const fileSizeElem = document.getElementById('fileSize');
    const warningElem = document.getElementById('warning');
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
    }

    function updateTotalContentChars() {
        const totalChars = Array.from(jsonTable.rows).reduce((total, row) => {
            const content = row.cells[1].textContent;
            return total + content.length;
        }, 0);
        totalContentChars.textContent = totalChars;
    }

    function displayWarning(message) {
        warningElem.innerText = message;
        warningElem.classList.add('show');
        setTimeout(() => {
            warningElem.classList.remove('show');
        }, 3000);
    }

    function addEntry() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (title === '' || content === '') {
            displayWarning('Please fill in both Title and Content.');
            return;
        }

        const titleLength = title.length;
        const contentLength = content.length;

        if (titleLength > 25) {
            displayWarning('Title exceeds the maximum length of 25 characters.');
            return;
        }

        if (contentLength > 150) {
            displayWarning('Content exceeds the maximum length of 150 characters.');
            return;
        }

        jsonData.push({ Title: title, Content: content });

        const row = jsonTable.insertRow();
        row.insertCell(0).textContent = title;
        row.insertCell(1).textContent = content;
        row.insertCell(2).textContent = titleLength;
        row.insertCell(3).textContent = contentLength;
        const actionCell = row.insertCell(4);
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-btn';
        removeButton.onclick = () => {
            jsonTable.deleteRow(row.rowIndex - 1);
            jsonData = jsonData.filter(data => data.Title !== title || data.Content !== content);
            updateTotalContentChars();
        };
        actionCell.appendChild(removeButton);

        updateCharCounts();
    }

    function downloadJSON() {
        const blob = new Blob([JSON.stringify(jsonData, null, 0)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                jsonData = JSON.parse(e.target.result);
                jsonTable.innerHTML = ''; // Clear the table
                jsonData.forEach(data => {
                    const row = jsonTable.insertRow();
                    row.insertCell(0).textContent = data.Title;
                    row.insertCell(1).textContent = data.Content;
                    row.insertCell(2).textContent = data.Title.length;
                    row.insertCell(3).textContent = data.Content.length;
                    const actionCell = row.insertCell(4);
                    const removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.className = 'remove-btn';
                    removeButton.onclick = () => {
                        jsonTable.deleteRow(row.rowIndex - 1);
                        jsonData = jsonData.filter(item => item.Title !== data.Title || item.Content !== data.Content);
                        updateTotalContentChars();
                    };
                    actionCell.appendChild(removeButton);
                });
                updateTotalContentChars();

                // Hide the open JSON button after file is opened
                fileInput.style.display = 'none';
                fileSizeElem.textContent = file.size;
            } catch (error) {
                displayWarning('Error reading JSON file.');
            }
        };
        reader.readAsText(file);
    }

    addEntryButton.addEventListener('click', addEntry);
    downloadButton.addEventListener('click', downloadJSON);
    fileInput.addEventListener('change', handleFileSelect);

    titleInput.addEventListener('input', updateCharCounts);
    contentInput.addEventListener('input', updateCharCounts);
});

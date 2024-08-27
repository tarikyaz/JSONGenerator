document.addEventListener('DOMContentLoaded', () => {
    // Get all the DOM elements
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
        updateTotalContentCharsAndSize();
    }

    function updateTotalContentCharsAndSize() {
        const totalChars = jsonData.reduce((total, entry) => {
            return total + entry.Title.length + entry.Content.length;
        }, 0) + titleInput.value.length + contentInput.value.length; // Include current input lengths

        const jsonSize = new Blob([JSON.stringify(jsonData)]).size;
        const currentJsonSize = new Blob([JSON.stringify([...jsonData, { Title: titleInput.value, Content: contentInput.value }])]).size;

        totalContentChars.textContent = totalChars;
        fileSizeElem.textContent = `${(currentJsonSize / 1024).toFixed(2)} KB`;

        if (currentJsonSize > 5120) { // 5 KB limit
            displayWarning(`Warning: Total JSON size exceeds 5 KB (${(currentJsonSize / 1024).toFixed(2)} KB).`);
            downloadButton.disabled = true;
            addEntryButton.disabled = true;
        } else {
            warningElem.style.display = 'none';
            downloadButton.disabled = false;
            addEntryButton.disabled = false;
        }
    }

    function displayWarning(message) {
        warningElem.innerText = message;
        warningElem.classList.add('show');
    }

    function addEntry() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (title === '' || content === '') {
            displayWarning('Please fill in both Title and Content.');
            return;
        }

        if (title.length > 25) {
            displayWarning('Title exceeds the maximum length of 25 characters.');
            return;
        }

        if (content.length > 150) {
            displayWarning('Content exceeds the maximum length of 150 characters.');
            return;
        }

        jsonData.push({ Title: title, Content: content });

        const row = jsonTable.insertRow();
        row.insertCell(0).textContent = title;
        row.insertCell(1).textContent = content;
        row.insertCell(2).textContent = title.length;
        row.insertCell(3).textContent = content.length;
        const actionCell = row.insertCell(4);
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-btn';
        removeButton.onclick = () => {
            jsonTable.deleteRow(row.rowIndex - 1);
            jsonData = jsonData.filter(data => data.Title !== title || data.Content !== content);
            updateTotalContentCharsAndSize();
        };
        actionCell.appendChild(removeButton);

        titleInput.value = '';
        contentInput.value = '';
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

                if (!Array.isArray(jsonData)) {
                    throw new Error('Invalid JSON format. Expected an array.');
                }

                jsonData.forEach(data => {
                    if (typeof data.Title !== 'string' || typeof data.Content !== 'string') {
                        throw new Error('Invalid data format. Each entry must have a Title and Content as strings.');
                    }
                    
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
                        updateTotalContentCharsAndSize();
                    };
                    actionCell.appendChild(removeButton);
                });

                updateTotalContentCharsAndSize();

                // Hide the open JSON button after file is opened
                fileInput.style.display = 'none';
            } catch (error) {
                displayWarning('Error reading or parsing JSON file.');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }

    // Ensure all elements exist before adding event listeners
    if (titleInput && contentInput && titleCharCount && contentCharCount && totalContentChars && fileSizeElem && warningElem && downloadButton && addEntryButton && jsonTable && fileInput) {
        addEntryButton.addEventListener('click', addEntry);
        downloadButton.addEventListener('click', downloadJSON);
        fileInput.addEventListener('change', handleFileSelect);

        titleInput.addEventListener('input', updateCharCounts);
        contentInput.addEventListener('input', updateCharCounts);
    } else {
        console.error('One or more elements are missing. Check the HTML for correct IDs.');
    }
});

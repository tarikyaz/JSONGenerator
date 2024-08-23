document.getElementById('fileInput').addEventListener('change', loadJSONFile);
document.getElementById('addEntryButton').addEventListener('click', addEntry);
document.getElementById('saveButton').addEventListener('click', saveJSON);

let jsonData = [];

function loadJSONFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            // Parse the JSON data
            jsonData = JSON.parse(event.target.result);
            displayTable();
        } catch (error) {
            alert("Invalid JSON file. Please make sure the file contains valid JSON.");
        }
    };

    reader.readAsText(file);
}

function displayTable() {
    const tableBody = document.querySelector('#jsonTable tbody');
    tableBody.innerHTML = '';
    
    jsonData.forEach((entry, index) => {
        const row = document.createElement('tr');

        const titleCell = document.createElement('td');
        titleCell.contentEditable = true;
        titleCell.innerText = entry.Title;
        row.appendChild(titleCell);

        const contentCell = document.createElement('td');
        contentCell.contentEditable = true;
        contentCell.innerText = entry.Content;
        row.appendChild(contentCell);

        const actionsCell = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.innerText = 'Remove';
        removeButton.classList.add('remove-btn');
        removeButton.addEventListener('click', () => removeEntry(index));
        actionsCell.appendChild(removeButton);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}

function addEntry() {
    const titleInput = document.getElementById('titleInput').value;
    const contentInput = document.getElementById('contentInput').value;

    if (titleInput && contentInput) {
        jsonData.push({ Title: titleInput, Content: contentInput });
        displayTable();

        // Clear input fields
        document.getElementById('titleInput').value = '';
        document.getElementById('contentInput').value = '';
    } else {
        alert("Both Title and Content are required.");
    }
}

function removeEntry(index) {
    jsonData.splice(index, 1);
    displayTable();
}

function saveJSON() {
    const rows = document.querySelectorAll('#jsonTable tbody tr');
    jsonData = [];

    rows.forEach(row => {
        const title = row.children[0].innerText;
        const content = row.children[1].innerText;

        jsonData.push({ Title: title, Content: content });
    });

    // Save the JSON in a compact format (no spaces or line breaks)
    const compactJSON = JSON.stringify(jsonData);
    const jsonBlob = new Blob([compactJSON], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(jsonBlob);
    link.download = 'data.json';
    link.click();
}

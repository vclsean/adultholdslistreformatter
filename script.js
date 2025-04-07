document.getElementById('processButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let processedData = processSpreadsheet(jsonData);
        displayTable(processedData);
        document.getElementById('printButton').style.display = 'block';
    };

    reader.readAsArrayBuffer(file);
});

function processSpreadsheet(data) {
    if (data.length < 3) return [];

    data.splice(0, 1);
    data.splice(1, 1);

    for (let row of data) {
        if (row[1] === undefined || row[1] === null || row[1] === '') {
            row[1] = '---';
        }
    }

    const headers = data[0];
    const columnsToDelete = ["Publication details", "Send to", "Notes", "Date", "Collection"];
    const indicesToDelete = [];

    for (let i = 0; i < headers.length; i++) {
        if (columnsToDelete.includes(headers[i])) {
            indicesToDelete.push(i);
        }
    }
    indicesToDelete.sort((a, b) => b - a);

    for (const index of indicesToDelete) {
        for (const row of data) {
            row.splice(index, 1);
        }
    }

    const titleIndex = headers.indexOf("Title");
    if (titleIndex !== -1) {
        for (let i = 1; i < data.length; i++) {
            if (data[i][titleIndex]) {
                data[i][titleIndex] = data[i][titleIndex].replace(/\d{5,}/g, '');
            }
        }
    }

    const barcodeIndex = headers.indexOf("Barcode");
    if (barcodeIndex !== -1) {
        for (let i = 1; i < data.length; i++) {
            if (data[i][barcodeIndex]) {
                data[i][barcodeIndex] = data[i][barcodeIndex].replace(" or any available", "");
            }
        }
    }

    const callNumberIndex = headers.indexOf("Call number");
    const shelvingLocationIndex = headers.indexOf("Shelving location");

    if (shelvingLocationIndex !== -1) {
        const rowsToDelete = [];
        for (let i = 1; i < data.length; i++) {
            if (data[i][shelvingLocationIndex] === "Parenting materials") {
                rowsToDelete.push(i);
            }
        }
        rowsToDelete.sort((a, b) => b - a);
        for (const rowIndex of rowsToDelete) {
            data.splice(rowIndex, 1);
        }
    }

if (callNumberIndex !== -1 || shelvingLocationIndex !== -1) {
    const rowsToDelete = [];
    
    for (let i = 1; i < data.length; i++) {
        let shouldDelete = false;
        
        // Check "Call Number" column
        if (callNumberIndex !== -1 && data[i][callNumberIndex]) {
            const callNumber = data[i][callNumberIndex];
            if (callNumber.startsWith("JE ") || callNumber.startsWith("JP ") || callNumber.startsWith("J ") || 
                callNumber.startsWith("HOLIDAY JP ") || callNumber.startsWith("HOLIDAY J ") || callNumber.startsWith("HOLIDAY BB ") || 
                callNumber.startsWith("HOLIDAY JE ") || callNumber.startsWith("JB ") || callNumber.startsWith("JUV-") ||  callNumber.startsWith("SERIES J ") ||
                callNumber.startsWith("BB ")) {
                shouldDelete = true;
            }
        }

        // Check "Shelving location" column
        if (shelvingLocationIndex !== -1 && data[i][shelvingLocationIndex] === "Board Books") {
            shouldDelete = true;
        }

        if (shouldDelete) {
            rowsToDelete.push(i);
        }
    }

    // Sort indexes in descending order to prevent shifting issues while deleting
    rowsToDelete.sort((a, b) => b - a);
    
    // Delete rows from the data array
    for (const rowIndex of rowsToDelete) {
        data.splice(rowIndex, 1);
    }
}


    if (shelvingLocationIndex !== -1 && callNumberIndex !== -1) {
        for (let row of data) {
            const callNumber = row.splice(callNumberIndex, 1)[0];
            const shelvingLocation = row.splice(shelvingLocationIndex, 1)[0];
            row.unshift(callNumber);
            row.unshift(shelvingLocation);
        }
    }

    if (data.length > 2) {
        const headerRow = data.shift();
        const shelvingIndex = headers.indexOf("Shelving location");
        const callNumberIndexSort = headers.indexOf("Call number");
        const authorIndex = headers.indexOf("Author");
        const titleIndexSort = headers.indexOf("Title");

        if (shelvingIndex !== -1 && callNumberIndexSort !== -1 && authorIndex !== -1 && titleIndexSort !== -1) {
            data.sort((a, b) => {
                if (a[shelvingIndex] > b[shelvingIndex]) return 1;
                if (a[shelvingIndex] < b[shelvingIndex]) return -1;
                if (a[callNumberIndexSort] > b[callNumberIndexSort]) return 1;
                if (a[callNumberIndexSort] < b[callNumberIndexSort]) return -1;
                if (a[authorIndex] > b[authorIndex]) return 1;
                if (a[authorIndex] < b[authorIndex]) return -1;
                if (a[titleIndexSort] > b[titleIndexSort]) return 1;
                if (a[titleIndexSort] < b[titleIndexSort]) return -1;
                return 0;
            });
        }
        data.unshift(headerRow);

        if (shelvingIndex !== -1) {
            for (let i = 1; i < data.length; i++) {
                if (data[i][shelvingIndex] === "General Fiction") data[i][shelvingIndex] = "Fiction";
                if (data[i][shelvingIndex] === "Non-Entertainment DVD") data[i][shelvingIndex] = "DOC DVD";
                if (data[i][shelvingIndex] === "New Non-Entertainment DVD") data[i][shelvingIndex] = "New DOC DVD";
                if (data[i][shelvingIndex] === "Television Series DVD") data[i][shelvingIndex] = "TV DVD";
                if (data[i][shelvingIndex] === "Paperback Books") data[i][shelvingIndex] = "Paperback";
                if (data[i][shelvingIndex] === "Large Type Fiction") data[i][shelvingIndex] = "LP Fiction";
                if (data[i][shelvingIndex] === "Biography & Autobiography") data[i][shelvingIndex] = "Bios";
                if (data[i][shelvingIndex] === "New Biography & Autobiography") data[i][shelvingIndex] = "New Bios";
                if (data[i][shelvingIndex] === "Large Type Nonfiction") data[i][shelvingIndex] = "LP Nonfiction";
                if (data[i][shelvingIndex] === "New Large Type Fiction") data[i][shelvingIndex] = "New LP Fiction";
                if (data[i][shelvingIndex] === "New Large Type Nonfiction") data[i][shelvingIndex] = "New LP Nonfiction";
                if (data[i][shelvingIndex] === "Book on CD") data[i][shelvingIndex] = "Audiobook";
                if (data[i][shelvingIndex] === "Scores and Sheet Music") data[i][shelvingIndex] = "Scores";
                if (data[i][shelvingIndex] === "Science Fiction & Fantasy") data[i][shelvingIndex] = "Sci-Fi & Fantasy";
                if (data[i][shelvingIndex] === "New Science Fiction") data[i][shelvingIndex] = "New Sci-Fi";
                if (data[i][shelvingIndex] === "DVD/Video Anime") data[i][shelvingIndex] = "Anime DVD";
            }
        }
    }

    return data;
}

function displayTable(data) {
    let tableHtml = '<table id="outputTable">';
    if (data.length > 0) {
        tableHtml += '<tr>';
        for (let header of data[0]) {
            tableHtml += '<th>' + (header === undefined ? "" : header) + '</th>';
        }
        tableHtml += '</tr>';

        const callNumberIndex = data[0].indexOf("Call number");
        let maxCallNumberWidth = 0;
        if (callNumberIndex !== -1) {
            for (let i = 1; i < data.length; i++) {
                const callNumber = data[i][callNumberIndex];
                if (callNumber) {
                    maxCallNumberWidth = Math.max(maxCallNumberWidth, callNumber.length);
                }
            }
        }

        for (let i = 0; i < data.length; i++) {
            if (i === 0) continue;
            tableHtml += '<tr>';
            for (let j = 0; j < data[i].length; j++) {
                let cell = data[i][j];
                if (j === callNumberIndex && callNumberIndex !== -1) {
                    tableHtml += `<td style="width: ${maxCallNumberWidth * 8}px; white-space: nowrap; font-weight: bold;">${cell === undefined ? "" : cell}</td>`;
                } else {
                    tableHtml += '<td>' + (cell === undefined ? "" : cell) + '</td>';
                }
            }
            tableHtml += '</tr>';
        }
    }
    tableHtml += '</table>';
    document.getElementById('output').innerHTML = tableHtml;
}

document.getElementById('printButton').addEventListener('click', function() {
    const printContents = document.getElementById('outputTable').outerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
});

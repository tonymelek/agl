document.getElementById('csvForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a CSV file.');
        return;
    }

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (event) {
        const csv = event.target.result;
        const jsonArray = csvToJSON(csv);
        usage = jsonArray;
        totalDailyCost();
    };
});

function csvToJSON(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines.shift().split(',');
    return lines.map(line => {
        const values = line.split(',');
        return headers.reduce((acc, curr, index) => {
            return { ...acc, [curr]:values[index] }
        }, {})
    });

}

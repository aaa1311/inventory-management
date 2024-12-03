// ** Constants **
const REQUESTS_KEY = 'requests_data';
const INVENTORY_KEY = 'inventory_data';

// ** Utility Functions **
function loadInventory() {
    const data = localStorage.getItem(INVENTORY_KEY);
    return data ? JSON.parse(data) : [];
}

function loadRequests() {
    const data = localStorage.getItem(REQUESTS_KEY);
    return data ? JSON.parse(data) : [];
}

function saveRequests(data) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(data));
}

function saveInventory(data) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(data));
}

// ** DOM Elements **
const requestsForm = document.getElementById('requestsForm');
const requestsBody = document.getElementById('requestsBody');
const requestedItem = document.getElementById('requestedItem');
const requestDate = document.getElementById('requestDate');
const requesterName = document.getElementById('requesterName');
const requestedQty = document.getElementById('requestedQty');
const exportExcelBtn = document.getElementById("exportExcel");

// ** Render Functions **
function renderRequests() {
    const requests = loadRequests();
    requestsBody.innerHTML = '';

    requests.forEach((request, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.date}</td>
            <td contenteditable="true" onblur="updateRequesterName(${index}, this.innerText)">${request.requester}</td>
            <td>
                <select onchange="updateRequestedItem(${index}, this.value)" class="form-select">
                    ${loadInventory().map(item => `
                        <option value="${item.name}" ${item.name === request.item ? 'selected' : ''}>${item.name}</option>
                    `).join('')}
                </select>
            </td>
            <td contenteditable="true" onblur="updateRequestedQty(${index}, this.innerText)">${request.qty}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteRequest(${index})">Delete</button>
            </td>
        `;
        requestsBody.appendChild(row);
    });
}

function populateItemDropdown() {
    const inventory = loadInventory();
    requestedItem.innerHTML = inventory.length > 0
        ? inventory.map(item => `<option value="${item.name}">${item.name}</option>`).join('')
        : `<option disabled>No items available</option>`;
}

// ** CRUD Operations **
requestsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const date = requestDate.value;
    const requester = requesterName.value.trim();
    const qty = parseInt(requestedQty.value);
    const item = requestedItem.value;

    if (date && requester && item && !isNaN(qty)) {
        const requests = loadRequests();
        const inventory = loadInventory();
        const inventoryItem = inventory.find(i => i.name === item);

        if (inventoryItem && inventoryItem.in - inventoryItem.out >= qty) {
            inventoryItem.out += qty;
            requests.push({ date, requester, item, qty });
            saveRequests(requests);
            saveInventory(inventory);
            renderRequests();
            populateItemDropdown();
            requestsForm.reset();
        } else {
            alert('Not enough quantity in inventory.');
        }
    } else {
        alert('Please fill out all fields correctly.');
    }
});

function updateRequesterName(index, newName) {
    const requests = loadRequests();
    requests[index].requester = newName.trim();
    saveRequests(requests);
}

function updateRequestedItem(index, newItem) {
    const requests = loadRequests();
    const inventory = loadInventory();

    const oldRequest = requests[index];
    const oldItemName = oldRequest.item;
    const oldQty = oldRequest.qty;

    const oldInventoryItem = inventory.find(i => i.name === oldItemName);
    const newInventoryItem = inventory.find(i => i.name === newItem);

    if (oldInventoryItem) oldInventoryItem.out -= oldQty;

    if (newInventoryItem && newInventoryItem.in - newInventoryItem.out >= oldQty) {
        newInventoryItem.out += oldQty;
        oldRequest.item = newItem;
        saveRequests(requests);
        saveInventory(inventory);
        renderRequests();
    } else {
        alert("Not enough quantity available for the new item!");
        if (oldInventoryItem) oldInventoryItem.out += oldQty;
        renderRequests();
    }
}

function updateRequestedQty(index, newQty) {
    const qty = parseInt(newQty);
    if (isNaN(qty)) {
        alert('Please enter a valid quantity.');
        renderRequests();
        return;
    }

    const requests = loadRequests();
    const inventory = loadInventory();

    const request = requests[index];
    const inventoryItem = inventory.find(i => i.name === request.item);

    if (inventoryItem && inventoryItem.in - inventoryItem.out + request.qty >= qty) {
        inventoryItem.out = inventoryItem.out - request.qty + qty;
        request.qty = qty;
        saveRequests(requests);
        saveInventory(inventory);
        renderRequests();
    } else {
        alert("Not enough quantity available in inventory.");
        renderRequests();
    }
}

function deleteRequest(index) {
    const requests = loadRequests();
    const inventory = loadInventory();

    const request = requests[index];
    const inventoryItem = inventory.find(i => i.name === request.item);

    if (inventoryItem) inventoryItem.out -= request.qty;

    requests.splice(index, 1);
    saveRequests(requests);
    saveInventory(inventory);
    renderRequests();
}

// ** Export to Excel **
exportExcelBtn.addEventListener("click", () => {
    const table = document.getElementById("requestsTable");
    const workbook = XLSX.utils.table_to_book(table, { sheet: "Requests" });
    XLSX.writeFile(workbook, "requests_data.xlsx");
});

// ** Initialize Page **
document.addEventListener("DOMContentLoaded", () => {
    populateItemDropdown();
    renderRequests();
});

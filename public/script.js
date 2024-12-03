// Array to store inventory data
let inventory = [];

// Array to store requests data
let requests = [];

// DOM Elements
const inventoryForm = document.getElementById('inventoryForm');
const inventoryBody = document.getElementById('inventoryBody');
const requestForm = document.getElementById('requestForm');
const requestsBody = document.getElementById('requestsBody');
const requestItem = document.getElementById('requestItem'); // Dropdown for items in requests

// Function to render inventory table
function renderInventory() {
    inventoryBody.innerHTML = '';
    inventory.forEach((item, index) => {
        const diff = item.in - item.out;
        inventoryBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.in}</td>
                <td>${item.out}</td>
                <td>${diff}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteInventory(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
    populateRequestItems();
}

// Function to populate request dropdown with inventory items
function populateRequestItems() {
    requestItem.innerHTML = '';
    inventory.forEach(item => {
        const diff = item.in - item.out;
        if (diff > 0) {
            requestItem.innerHTML += `<option value="${item.name}">${item.name}</option>`;
        }
    });
}

// Function to render requests table
function renderRequests() {
    requestsBody.innerHTML = '';
    requests.forEach((req, index) => {
        requestsBody.innerHTML += `
            <tr>
                <td>${req.date}</td>
                <td>${req.requester}</td>
                <td>${req.quantity}</td>
                <td>${req.item}</td>
                <td>${req.department}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteRequest(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

// Add item to inventory
inventoryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('itemName').value.trim();
    const itemIn = parseInt(document.getElementById('itemIn').value);
    const itemOut = parseInt(document.getElementById('itemOut').value);

    if (name && !isNaN(itemIn) && !isNaN(itemOut)) {
        inventory.push({ name, in: itemIn, out: itemOut });
        renderInventory();
        inventoryForm.reset();
    }
});

// Add request to requests
requestForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const date = document.getElementById('requestDate').value;
    const requester = document.getElementById('requesterName').value.trim();
    const quantity = parseInt(document.getElementById('requestQuantity').value);
    const item = document.getElementById('requestItem').value;
    const department = document.getElementById('requestDepartment').value;

    // Check if quantity is valid
    const selectedItem = inventory.find(inv => inv.name === item);
    const availableQty = selectedItem.in - selectedItem.out;

    if (quantity > availableQty) {
        alert(`Error: Quantity exceeds available stock (${availableQty}).`);
        return;
    }

    if (date && requester && item && department && !isNaN(quantity)) {
        requests.push({ date, requester, quantity, item, department });

        // Update inventory out quantity
        selectedItem.out += quantity;
        renderRequests();
        renderInventory();
        requestForm.reset();
    }
});

// Delete inventory item
function deleteInventory(index) {
    inventory.splice(index, 1);
    renderInventory();
}

// Delete request
function deleteRequest(index) {
    const req = requests[index];
    const selectedItem = inventory.find(inv => inv.name === req.item);

    // Restore quantity to inventory
    selectedItem.out -= req.quantity;
    requests.splice(index, 1);
    renderRequests();
    renderInventory();
}

// Initial rendering
renderInventory();
renderRequests();

const INVENTORY_KEY = 'inventory_data';

// Load inventory data from LocalStorage
function loadInventory() {
    const data = localStorage.getItem(INVENTORY_KEY);
    return data ? JSON.parse(data) : [];
}

// Save inventory data to LocalStorage
function saveInventory(data) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(data));
}

// DOM Elements
const inventoryForm = document.getElementById('inventoryForm');
const inventoryBody = document.getElementById('inventoryBody');

// Render inventory table
function renderInventory() {
    const inventory = loadInventory();
    inventoryBody.innerHTML = '';
    inventory.forEach((item, index) => {
        const availableQty = item.in - item.out;
        inventoryBody.innerHTML += `
            <tr>
                <td contenteditable="true" onblur="updateItemName(${index}, this.innerText)">${item.name}</td>
                <td contenteditable="true" onblur="updateInQuantity(${index}, this.innerText)">${item.in}</td>
                <td>${item.out}</td>
                <td>${availableQty}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteInventoryItem(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

// Add new item to inventory
inventoryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const itemName = document.getElementById('itemName').value.trim();
    const itemIn = parseInt(document.getElementById('itemIn').value);

    if (itemName && !isNaN(itemIn)) {
        const inventory = loadInventory();

        // Check if item already exists
        const existingItem = inventory.find(item => item.name.toLowerCase() === itemName.toLowerCase());
        if (existingItem) {
            existingItem.in += itemIn;
        } else {
            inventory.push({ name: itemName, in: itemIn, out: 0 });
        }

        saveInventory(inventory);
        renderInventory();
        inventoryForm.reset();
    }
});

// Update item name
function updateItemName(index, newName) {
    const inventory = loadInventory();
    inventory[index].name = newName.trim();
    saveInventory(inventory);
    renderInventory();
}

// Update "in" quantity
function updateInQuantity(index, newIn) {
    const inventory = loadInventory();
    const parsedNewIn = parseInt(newIn);

    if (!isNaN(parsedNewIn) && parsedNewIn >= inventory[index].out) {
        inventory[index].in = parsedNewIn;
        saveInventory(inventory);
        renderInventory();
    } else {
        alert('Invalid quantity. It must be greater than or equal to the "out" quantity.');
        renderInventory();
    }
}
// Delete an Inventory Item
function deleteInventoryItem(index) {
    const inventory = loadInventory();

    if (confirm('Are you sure you want to delete this item?')) {
        inventory.splice(index, 1);
        saveInventory(inventory);
        renderInventory();
        populateItemDropdown();
    }
}

function exportToExcel(tableId, filename) {
    const table = document.getElementById(tableId); // حدد الجدول بناءً على الـ ID
    if (!table) {
        alert('Table not found!');
        return;
    }

    // تحويل الجدول إلى كتاب Excel
    const workbook = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });

    // تحميل ملف Excel
    XLSX.writeFile(workbook, filename || 'export.xlsx');
}
// Initial rendering
renderInventory();

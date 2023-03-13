class MovementTable extends HTMLElement {
    template = document.createElement('template');

    templateContent = `
        <style>
            .table {
                width: 100%;
                border-collapse: collapse;
            }
            .table th, .table td {
                border: 1px solid #ddd;
                padding: 8px;
            }
            .table tr:nth-child(even){background-color: #f2f2f2;}
            .table tr:hover {background-color: #ddd;}
            .table th {
                padding-top: 12px;
                padding-bottom: 12px;
                text-align: left;
                background-color: #4CAF50;
                color: white;
            }
            #monthTabs td {
                border: none;
                width: 100%;
                flex-wrap: wrap;
            }
            #monthTabs td button {
                border: none;
                background-color: #4CAF50;
                color: white;
                padding: 5px 10px;
                margin: 5px;
                cursor: pointer;
            }
            #monthTabs td button:hover {
                opacity: 0.8;
            }
        </style>

        <table class="table">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>To</th>
                    <th>From</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>No data</td>
                    <td>1000</td>
                    <td>2020-01-01</td>
                    <td>No data</td>
                    <td>No data</td>
                    <td>No data</td>
                    <td>
                        <button>Edit</button>
                        <button>Delete</button>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td>
                        Page: <span id="currentPage">1</span>/<span id="totalPages">1</span>
                    </td>
                    <td colspan="5">
                        Ammount total: <span id="movementTotal">0</span>
                    </td>
                    <td>
                        <button id="downloadBtn">Download</button>
                        <button id="loadBtn">Load</button>
                    </td>
                    <td>
                        <button id="prevPageBtn">Prev</button>
                        <button id="nextPageBtn">Next</button>
                    </td>
                </tr>
                <tr id="monthTabs">
                    <td colspan="8">
                    </td>
                </tr>
            </tfoot>
        </table>
    `;

    isEditing = false;
    currentPage = 1;
    pageSize = 5;
    selectedMonth = `${this.currentMonth < 10 ? '0' + String(this.currentMonth) : this.currentMonth}/${new Date().getFullYear()}`;

    get currentMonth() {
        return new Date().getMonth() + 1;
    }

    get movements() {
        return JSON.parse(localStorage.getItem('movements')) || [];
    }

    set movements(movements) {
        localStorage.setItem('movements', JSON.stringify(movements));
    }

    get movementsByMonthAndYear() {
        const movements = this.movements;
        const movementsByMonthAndYear = {};
        movements.forEach(movement => {
            const month = movement.date.split('-')[1];
            const year = movement.date.split('-')[0];
            const key = `${month}/${year}`
            if (!movementsByMonthAndYear[key]) {
                movementsByMonthAndYear[key] = [];
            }
            movementsByMonthAndYear[key].push(movement);
        });
        return movementsByMonthAndYear;
    }

    get lastId() {
        const movements = JSON.parse(localStorage.getItem('movements'));
        if (!movements || movements.length === 0) {
            return 0;
        }
        return movements[movements.length - 1].id;
    }

    get total() {
        return this.movementsByMonthAndYear[this.selectedMonth].reduce((acc, movement) => parseFloat(acc) + parseFloat(movement.amount), 0);
    }

    get table() {
        return this.shadowRoot.querySelector('table');
    }

    get tbody() {
        return this.table.querySelector('tbody');
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.template.innerHTML = this.templateContent;
        this.shadowRoot.appendChild(this.template.content.cloneNode(true));
    }

    connectedCallback() {
        this.updateTable();
        this.table.querySelector('#prevPageBtn').addEventListener('click', this.handlePrevPage);
        this.table.querySelector('#nextPageBtn').addEventListener('click', this.handleNextPage);
        this.table.querySelector('#downloadBtn').addEventListener('click', this.handleDownload);
        this.table.querySelector('#loadBtn').addEventListener('click', this.handleLoad);
    }

    handleDownload = () => {
        //downloads all movements in a csv file
        const movements = this.movements;
        let csvContent = "data:text/csv;charset=utf-8,";
        movements.forEach(movement => {
            const row = `${movement.id},${movement.description},${movement.amount},${movement.date},${movement.category},${movement.to},${movement.from}`;
            csvContent += row + "\r\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "movements.csv");
        document.body.appendChild(link);
        link.click();
    }

    handleLoad = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const csv = e.target.result;
                const movements = [];
                const rows = csv.split("\r\n");
                rows.forEach(row => {
                    const movement = row.split(',');
                    if (!movement[0]) {
                        return;
                    }
                    movements.push({
                        id: parseInt(movement[0]),
                        description: movement[1],
                        amount: parseFloat(movement[2]),
                        date: movement[3],
                        category: movement[4],
                        to: movement[5],
                        from: movement[6]
                    });
                });
                this.movements = movements;
                this.updateTable();
            };
            reader.readAsText(file);
        }
        input.click();
    }

    handlePrevPage = () => {
        if (this.currentPage === 1) {
            return;
        }
        this.currentPage--;
        this.updateTable();
    }

    handleNextPage = () => {
        if (this.currentPage === Math.ceil(this.movements.length / this.pageSize)) {
            return;
        }
        this.currentPage++;
        this.updateTable();
    }

    getActionButtons(id) {
        return `
            <button class="editBtn" data-id="${id}">Edit</button>
            <button class="deleteBtn" data-id="${id}">Delete</button>
        `;
    }

    updateTable() {
        this.tbody.innerHTML = '';
        const monthMovements = this.movementsByMonthAndYear[this.selectedMonth];
        if (!monthMovements || monthMovements.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = ''
            this.tbody.appendChild(tr);
        return;
        }
        const pageMovements = this.movementsByMonthAndYear[this.selectedMonth].slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
        pageMovements.forEach(movement => {
            const tr = document.createElement('tr');
            tr.id = `movement-${movement.id}`;
            tr.innerHTML = `
                <td>${movement.id}</td>
                <td>${movement.description}</td>
                <td>${movement.amount}</td>
                <td>${movement.date}</td>
                <td>${movement.category}</td>
                <td>${movement.to}</td>
                <td>${movement.from}</td>
                <td>${this.getActionButtons(movement.id)}</td>
            `;
            this.tbody.appendChild(tr);
            tr.querySelector('.deleteBtn').addEventListener('click', this.handleDelete);
            tr.querySelector('.editBtn').addEventListener('click', this.handleEdit);
        });
        this.table.querySelector('#movementTotal').innerHTML = `${this.total}`;
        this.table.querySelector('#currentPage').innerHTML = `${this.currentPage}`;
        this.table.querySelector('#totalPages').innerHTML = `${Math.ceil(this.movements.length / this.pageSize)}`;
        this.renderMonthsTabs();
    }

    renderMonthsTabs() {
        const tabNames = Object.keys(this.movementsByMonthAndYear);
        const tabButtons = tabNames.map(tabName => {
            const button = document.createElement('button');
            button.value = tabName;
            button.innerHTML = tabName;
            return button;
        });
        this.table.querySelector('#monthTabs td').innerHTML = `
        Months:
                ${tabButtons.map(button => button.outerHTML).join('')}
        `;
        this.table.querySelectorAll('#monthTabs button').forEach(button => {
            button.addEventListener('click', this.handleMonthTabClick);
        });
    }

    handleMonthTabClick = (e) => {
        this.selectedMonth = e.target.value;
        this.currentPage = 1;
        this.updateTable();
    }

    handleEdit = (e) => {
        if (this.isEditing) {
            return;
        }
        this.isEditing = true;
        const id = e.target.dataset.id;
        const movement = this.movements.find(movement => movement.id == id);
        this.tbody.querySelector(`#movement-${id}`).innerHTML = `
            <td>${movement.id}</td>
            <td><input type="text" value="${movement.description}"></td>
            <td><input type="number" value="${movement.amount}"></td>
            <td><input type="date" value="${movement.date}"></td>
            <td><input type="text" value="${movement.category}"></td>
            <td><input type="text" value="${movement.to}"></td>
            <td><input type="text" value="${movement.from}"></td>
            <td><button id="doneEditBtn" data-id="${movement.id}">Done</button></td>
        `;
        this.tbody.querySelector('#doneEditBtn').addEventListener('click', this.handleDoneEdit);
    }

    handleDoneEdit = (e) => {
        const id = e.target.dataset.id;
        //creates new object so we can manipulate the instance
        const movements = this.movements;
        const movement = movements.find(movement => movement.id == id);
        const inputs = e.target.parentElement.parentElement.querySelectorAll('input');

        movement.description = inputs[0].value;
        movement.amount = inputs[1].value;
        movement.date = inputs[2].value;
        movement.category = inputs[3].value;
        movement.to = inputs[4].value;
        movement.from = inputs[5].value;

        this.movements = movements;
        this.updateTable();
        this.isEditing = false;
    }


    handleDelete = (e) => {
        const id = e.target.dataset.id;
        this.movements = this.movements.filter(movement => movement.id != id);
        if (!this.movementsByMonthAndYear[this.selectedMonth]) {
            const months = Object.keys(this.movementsByMonthAndYear);
            this.selectedMonth = months[months.length - 1];
        }
        this.updateTable();
    }

    handleAddMovement = ({detail: data}) => {
        data.id = this.lastId + 1;
        const movements = this.movements;
        movements.push(data);
        this.movements = movements;
        this.updateTable();
    }
}

customElements.define('movement-table', MovementTable);
class AddMovementForm extends HTMLElement {
    template = document.createElement('template');
    templateContent = `
        <style>
            .form {
                border: 3px solid #f1f1f1;
                width: 50%;
                margin: 0 auto;
            }
            .form input[type=text], .form input[type=number], .form input[type=date] {
                width: 100%;
                padding: 5px 15px;
                margin: 8px 0;
                display: inline-block;
                border: 1px solid #ccc;
                box-sizing: border-box;
            }
            .form button {
                background-color: #4CAF50;
                color: white;
                padding: 14px 20px;
                margin: 8px 0;
                border: none;
            }
            .form button:hover {
                opacity: 0.8;
            }
            .form .cancelbtn {
                width: auto;
                background-color: #f44336;
            }
            .form .container {
                padding: 16px;
            }
        </style>

        <form class="form">
            <label for="description"><b>Description</b></label>
            <input type="text" placeholder="Enter description" name="description" required>
            <label for="amount"><b>Amount</b></label>
            <input type="number" step="0.01" placeholder="Enter amount" name="amount" required>
            <label for="date"><b>Date</b></label>
            <input type="date" placeholder="Enter date" name="date" required>
            <label for="category"><b>Category</b></label>
            <input type="text" placeholder="Enter category" name="category" required>
            <label for="to"><b>To</b></label>
            <input type="text" placeholder="Enter to" name="to">
            <label for="from"><b>From</b></label>
            <input type="text" placeholder="Enter from" name="from">
            <button type="submit" id="submitBtn">Add</button>
            <button type="button" class="cancelbtn">Cancel</button>
        </form>
    `;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.template.innerHTML = this.templateContent;
        this.shadowRoot.appendChild(this.template.content.cloneNode(true));
        this.form = this.shadowRoot.querySelector('form');
    }

    connectedCallback() {
        this.shadowRoot.querySelector('.form').addEventListener('submit', this.submitForm.bind(this));
    }

    submitForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        this.dispatchEvent(new CustomEvent('onAdd', { detail: data }));
        e.target.reset();
    }
}

customElements.define('add-movement-form', AddMovementForm);
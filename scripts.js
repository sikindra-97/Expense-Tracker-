document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const loginContainer = document.querySelector('.login-container');
    const registerContainer = document.querySelector('.register-container');
    const expenseTrackerForm = document.querySelector('.expense-tracker-form');
    const expenseForm = document.getElementById('expense-form');
    const expenseNameInput = document.getElementById('expense-name');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseDateInput = document.getElementById('expense-date');
    const expenseList = document.getElementById('expense-list');
    const totalAmount = document.getElementById('total-amount');

    let total = 0;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Show Register Form
    document.getElementById('to-register').addEventListener('click', () => {
        loginContainer.classList.remove('active');
        registerContainer.classList.add('active');
    });

    // Show Login Form
    document.getElementById('to-login').addEventListener('click', () => {
        registerContainer.classList.remove('active');
        loginContainer.classList.add('active');
    });

    // Handle Registration
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value.trim();

        if (email && password) {
            const userExists = users.some(user => user.email === email);
            if (userExists) {
                alert('User already exists');
            } else {
                const newUser = { email, password };
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                alert('Registration successful');
                loginContainer.classList.add('active');
                registerContainer.classList.remove('active');
            }
        } else {
            alert('Please fill in all fields');
        }
    });

    // Handle Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();

        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            alert('Login successful');
            localStorage.setItem('loggedInUser', email);
            loginContainer.classList.remove('active');
            expenseTrackerForm.classList.add('active');
            loadExpenses();
        } else {
            alert('Invalid email or password');
        }
    });

    // Handle Expense Form Submission
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = expenseNameInput.value.trim();
        const amount = parseFloat(expenseAmountInput.value);
        const date = expenseDateInput.value;

        const loggedInUserEmail = localStorage.getItem('loggedInUser');
        if (!loggedInUserEmail) {
            alert('Please log in first');
            return;
        }

        if (name && !isNaN(amount) && amount > 0 && date) {
            const expenses = JSON.parse(localStorage.getItem('expenses')) || {};
            const userExpenses = expenses[loggedInUserEmail] || [];

            const id = Date.now().toString();
            const newExpense = { id, name, amount, date };
            userExpenses.push(newExpense);

            expenses[loggedInUserEmail] = userExpenses;
            localStorage.setItem('expenses', JSON.stringify(expenses));

            addExpenseToList(name, amount, date, id);
            total += amount;
            updateTotal();

            expenseNameInput.value = '';
            expenseAmountInput.value = '';
            expenseDateInput.value = '';
        } else {
            alert('Please enter a valid expense name, amount, and date.');
        }
    });

    // Load Expenses for Logged In User
    function loadExpenses() {
        const loggedInUserEmail = localStorage.getItem('loggedInUser');
        if (!loggedInUserEmail) return;

        const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || {};
        const userExpenses = savedExpenses[loggedInUserEmail] || [];

        userExpenses.forEach(expense => {
            addExpenseToList(expense.name, expense.amount, expense.date, expense.id);
        });

        total = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        updateTotal();
    }

    // Add Expense to List
    function addExpenseToList(name, amount, date, id) {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.dataset.id = id;
        listItem.innerHTML = `
            <span class="expense-name">${name}</span> 
            <span class="badge badge-primary badge-pill">₹${amount.toFixed(2)}</span> 
            <span class="text-muted">${date}</span>
            <button class="btn btn-warning btn-sm edit-btn">Edit</button>
            <button class="btn btn-danger btn-sm delete-btn">Delete</button>
        `;
        expenseList.appendChild(listItem);
    }

    // Update Total
    function updateTotal() {
        totalAmount.textContent = `₹${total.toFixed(2)}`;
    }

    // Edit and Delete Expense functionality
    expenseList.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.closest('.list-group-item')?.dataset.id;
        if (!id) return;

        if (target.classList.contains('edit-btn')) {
            handleEdit(id);
        } else if (target.classList.contains('delete-btn')) {
            handleDelete(id);
        }
    });

    // Handle Expense Edit
    function handleEdit(id) {
        const expenses = JSON.parse(localStorage.getItem('expenses')) || {};
        const loggedInUserEmail = localStorage.getItem('loggedInUser');
        const userExpenses = expenses[loggedInUserEmail] || [];
        const expense = userExpenses.find(exp => exp.id === id);
        if (expense) {
            expenseNameInput.value = expense.name;
            expenseAmountInput.value = expense.amount;
            expenseDateInput.value = expense.date;
            expenseForm.dataset.editingId = id;
        }
    }

    // Handle Expense Delete
    function handleDelete(id) {
        let expenses = JSON.parse(localStorage.getItem('expenses')) || {};
        const loggedInUserEmail = localStorage.getItem('loggedInUser');
        const userExpenses = expenses[loggedInUserEmail] || [];
        const expenseIndex = userExpenses.findIndex(exp => exp.id === id);
        if (expenseIndex !== -1) {
            const expenseToDelete = userExpenses[expenseIndex];
            if (confirm('Are you sure you want to delete this expense?')) {
                userExpenses.splice(expenseIndex, 1);
                expenses[loggedInUserEmail] = userExpenses;
                localStorage.setItem('expenses', JSON.stringify(expenses));

                total -= expenseToDelete.amount;
                updateTotal();

                const itemToRemove = document.querySelector(`[data-id="${id}"]`);
                if (itemToRemove) itemToRemove.remove();
            }
        }
    }
});

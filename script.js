const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const filter = document.getElementById("filters");
const clrBtn = document.getElementById("clear-completed");
const dueDateInput = document.getElementById("due-date-input");

let currentFilter = "all";

let tasks = [];
const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
};


function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        tasks = [];
    }
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
    let visibleTasks = tasks;
    if (currentFilter == "active") {
        visibleTasks = tasks.filter(t => !t.completed);
    }

    if (currentFilter === "completed") {
        visibleTasks = tasks.filter(t => t.completed);
    }
    taskList.innerHTML = "";
    visibleTasks = [...visibleTasks].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    visibleTasks.forEach((task) => {
        const li = document.createElement("li");
        li.setAttribute("data-id", task.id);

        if (task.completed) {
            li.classList.add("completed");
        }

        if (isOverdue(task)) {
            li.classList.add("overdue");
        }

        if (task.dueDate) {
            const dateSpan = document.createElement("span");
            dateSpan.className = "due-date";
            dateSpan.innerText = new Date(task.dueDate).toLocaleDateString();
            li.appendChild(dateSpan);
        }

        const select = document.createElement("select");
        ["low", "medium", "high"].forEach(p => {
            const option = document.createElement("option");
            option.value = p;
            option.textContent = p;
            if (task.priority === p) option.selected = true;
            select.appendChild(option);
        });


        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        const span = document.createElement("span");
        span.innerText = task.text;

        const delBtn = document.createElement("button");
        delBtn.innerText = "Delete";

        const editBtn = document.createElement("button");
        editBtn.innerText = "Edit";

        li.append(checkbox);
        li.appendChild(span);
        li.append(select);
        li.appendChild(delBtn);
        li.appendChild(editBtn);
        taskList.appendChild(li);
        updateClearButton();
    });
}

function addTask() {
    const dueDateVal = dueDateInput.value;
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: "medium",
        dueDate: dueDateVal ? new Date(dueDateVal).toISOString() : null,
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = "";
}


function startEdit(li, id) {
    const task = tasks.find(t => t.id === id);

    li.innerHTML = "";

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.value = task.text;

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = task.dueDate
        ? task.dueDate.split("T")[0]
        : "";

    li.appendChild(textInput);
    li.appendChild(dateInput);

    textInput.focus();

    function finish(save) {
        if (save) {
            const newText = textInput.value.trim();
            if (!newText) return;

            task.text = newText;
            task.dueDate = dateInput.value
                ? new Date(dateInput.value).toISOString()
                : null;

            saveTasks();
        }
        renderTasks();
    }

    li.addEventListener("keydown", (e) => {
        if (e.key === "Enter") finish(true);
        if (e.key === "Escape") finish(false);
    });
}


function finishEdit(id, newText) {
    newText = newText.trim();
    if (!newText) return;

    const task = tasks.find(t => t.id === id);
    task.text = newText;

    saveTasks();
    renderTasks();
}

function updateClearButton() {
    clrBtn.disabled = !tasks.some(t => t.completed);
}

function isOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
}


addTaskBtn.addEventListener("click", () => {
    addTask();
});

taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});

filter.addEventListener("click", (e) => {
    if (!e.target.dataset.filter) return;
    currentFilter = e.target.dataset.filter;
    renderTasks();
})

clrBtn.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
})

taskList.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!li) return;

    const id = Number(li.dataset.id);
    const task = tasks.find(t => t.id === id);

    if (e.target.type === "checkbox") {
        task.completed = e.target.checked;
        saveTasks();
        renderTasks();
        return;
    }

    if (e.target.innerText === "Delete") {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        return;
    }

    if (e.target.innerText === "Edit") {
        startEdit(li, id);
    }
});

taskList.addEventListener("change", e => {
    if (e.target.tagName !== "SELECT") return;

    const li = e.target.closest("li");
    const id = Number(li.dataset.id);

    const task = tasks.find(t => t.id === id);
    task.priority = e.target.value;

    saveTasks();
    renderTasks();
});

loadTasks();
renderTasks();
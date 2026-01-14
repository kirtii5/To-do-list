const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const filter = document.getElementById("filters");
const clrBtn = document.getElementById("clear-completed");
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
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: "medium"
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = "";
}


function startEdit(li, id) {
    const task = tasks.find(t => t.id === id);

    const input = document.createElement("input");
    input.value = task.text;

    li.innerHTML = "";
    li.appendChild(input);
    input.focus();

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            finishEdit(id, input.value);
        }
        if (e.key === "Escape") {
            renderTasks();
        }
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
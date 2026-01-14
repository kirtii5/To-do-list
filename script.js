const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");


let tasks = [];

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
    taskList.innerHTML = "";

    tasks.forEach((task) => {
        const li = document.createElement("li");
        li.setAttribute("data-id", task.id);

        if (task.completed) {
            li.classList.add("completed");
        }

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
        li.appendChild(delBtn);
        li.appendChild(editBtn);
        taskList.appendChild(li);
    });
}

addTaskBtn.addEventListener("click", () => {
    addTask();
});

taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});


function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = "";
}


taskList.addEventListener("click", (e) => {

    if (e.target.type === "checkbox") {
        const li = e.target.closest("li");
        const id = Number(li.dataset.id);

        const task = tasks.find(t => t.id === id);
        task.completed = e.target.checked;

        saveTasks();
        renderTasks();
        return;
    }

    const li = e.target.closest("li");
    if (!li) return;

    const id = Number(li.dataset.id);

    if (e.target.innerText === "Delete") {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    if (e.target.innerText === "Edit") {
        startEdit(li, id);
    }
});

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


loadTasks();
renderTasks();
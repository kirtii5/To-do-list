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

        const span = document.createElement("span");
        span.innerText = task.text;

        const delBtn = document.createElement("button");
        delBtn.innerText = "Delete";

        li.appendChild(span);
        li.appendChild(delBtn);
        taskList.appendChild(li);
    });
}

addTaskBtn.addEventListener("click", () => {
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
});

taskList.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        const li = e.target.parentElement;
        const id = Number(li.getAttribute("data-id"));

        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
});

loadTasks();
renderTasks();

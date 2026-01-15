const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const filter = document.getElementById("filters");
const clrBtn = document.getElementById("clear-completed");
const dueDateInput = document.getElementById("due-date-input");
const reminderSelect = document.getElementById("reminder-select");
const dueTimeInput = document.getElementById("due-time-input");


let currentFilter = "all";

let tasks = [];
const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
};


function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    tasks = savedTasks ? JSON.parse(savedTasks) : [];

    tasks = tasks.map(task => ({
        ...task,
        reminderMinutes: task.reminderMinutes ?? null,
        reminded: task.reminded ?? false
    }));
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

        if (isUpcoming(task)) {
            li.classList.add("upcoming");
        }

        if (task.dueDate) {
            const due = new Date(task.dueDate);

            const dateTimeSpan = document.createElement("span");
            dateTimeSpan.className = "due-date";

            const date = due.toLocaleDateString();
            const time = due.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

            dateTimeSpan.innerText = `📅 ${date} • ⏰ ${time}`;
            li.appendChild(dateTimeSpan);
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

        let reminderBadge = null;
        if (task.reminderMinutes != null) {
            reminderBadge = document.createElement("span");
            reminderBadge.className = "reminder-badge";
            reminderBadge.innerText = `⏰ ${task.reminderMinutes}m`;
        }

        const delBtn = document.createElement("button");
        delBtn.innerText = "Delete";

        const editBtn = document.createElement("button");
        editBtn.innerText = "Edit";

        li.append(checkbox);
        li.appendChild(span);
        if (reminderBadge) {
            li.appendChild(reminderBadge);
        }
        li.append(select);
        li.appendChild(delBtn);
        li.appendChild(editBtn);
        taskList.appendChild(li);
        updateClearButton();
        visibleTasks.forEach(scheduleReminder);
    });
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    let dueDateISO = null;

    if (dueDateInput.value) {
        const time = dueTimeInput.value || "23:59";
        dueDateISO = new Date(`${dueDateInput.value}T${time}`).toISOString();
    }

    const newTask = {
        id: Date.now(),
        text,
        completed: false,
        priority: "medium",
        dueDate: dueDateISO,
        reminderMinutes: reminderSelect.value
            ? Number(reminderSelect.value)
            : null,
        reminded: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = "";
    dueDateInput.value = "";
    reminderSelect.value = "";
    dueTimeInput.value = "";

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
    const timeInput = document.createElement("input");
    timeInput.type = "time";
    timeInput.value = task.dueDate
        ? new Date(task.dueDate).toISOString().substring(11, 16)
        : "";

    li.appendChild(timeInput);


    li.appendChild(textInput);
    li.appendChild(dateInput);

    textInput.focus();

    function finish(save) {
        task.reminded = false;
        reminderTimers.delete(task.id);

        if (save) {
            const newText = textInput.value.trim();
            if (!newText) return;

            task.text = newText;
            if (dateInput.value) {
                const time = timeInput.value || "23:59";
                task.dueDate = new Date(`${dateInput.value}T${time}`).toISOString();
            } else {
                task.dueDate = null;
            }

            saveTasks();
        }
        renderTasks();
    }

    li.addEventListener("keydown", (e) => {
        if (e.key === "Enter") finish(true);
        if (e.key === "Escape") finish(false);
    });

    taskInput.value = "";
    dueDateInput.value = "";
    reminderSelect.value = "";
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

function checkReminders() {
    const now = new Date();

    tasks.forEach(task => {
        if (
            task.completed ||
            task.reminded ||
            !task.dueDate ||
            task.reminderMinutes == null
        ) return;

        const due = new Date(task.dueDate);
        const reminderTime = new Date(
            due.getTime() - task.reminderMinutes * 60 * 1000
        );

        if (now >= reminderTime && now <= due) {
            alert(`Reminder: "${task.text}" is due soon`);
            task.reminded = true;
        }
    });

    saveTasks();
}

function getReminderTime(task) {
    if (!task.dueDate || task.reminderMinutes == null) return null;
    return new Date(
        new Date(task.dueDate).getTime() -
        task.reminderMinutes * 60 * 1000
    );
}

function isUpcoming(task) {
    const reminderTime = getReminderTime(task);
    if (!reminderTime || task.completed) return false;
    const now = new Date();
    return now >= reminderTime && now < new Date(task.dueDate);
}

let reminderTimers = new Map();

function scheduleReminder(task) {
    if (
        task.completed ||
        task.reminded ||
        !task.dueDate ||
        task.reminderMinutes == null
    ) return;

    const reminderTime = getReminderTime(task);
    if (!reminderTime) return;

    const delay = reminderTime.getTime() - Date.now();
    if (delay <= 0) return;

    clearTimeout(reminderTimers.get(task.id));

    const timerId = setTimeout(() => {
        alert(`Reminder: "${task.text}" is due soon`);
        task.reminded = true;
        saveTasks();
        renderTasks();
    }, delay);

    reminderTimers.set(task.id, timerId);
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
checkReminders();
setInterval(checkReminders, 60 * 1000);

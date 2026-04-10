const STORAGE_KEY = "todo-atelier-items";

const todoForm = document.querySelector("#todoForm");
const todoInput = document.querySelector("#todoInput");
const todoList = document.querySelector("#todoList");
const listHint = document.querySelector("#listHint");
const totalCount = document.querySelector("#totalCount");
const doneCount = document.querySelector("#doneCount");
const pendingCount = document.querySelector("#pendingCount");
const todoItemTemplate = document.querySelector("#todoItemTemplate");

let todos = loadTodos();

renderTodos();

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();
  if (!text) {
    todoInput.focus();
    return;
  }

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
  });

  persistAndRender();
  todoForm.reset();
  todoInput.focus();
});

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  renderTodos();
}

function renderTodos() {
  todoList.innerHTML = "";

  if (todos.length === 0) {
    listHint.textContent = "No tasks yet. Add the first one.";
  } else {
    listHint.textContent = `${todos.length} task(s) in view. Use Edit to change any item inline.`;
  }

  todos.forEach((todo) => {
    const fragment = todoItemTemplate.content.cloneNode(true);
    const item = fragment.querySelector(".todo-item");
    const toggle = fragment.querySelector(".todo-toggle");
    const text = fragment.querySelector(".todo-text");
    const editInput = fragment.querySelector(".todo-edit-input");
    const editButton = fragment.querySelector(".edit-button");
    const saveButton = fragment.querySelector(".save-button");
    const deleteButton = fragment.querySelector(".delete-button");

    item.dataset.id = todo.id;
    item.classList.toggle("is-done", todo.done);
    text.textContent = todo.text;
    editInput.value = todo.text;
    toggle.checked = todo.done;

    toggle.addEventListener("change", () => {
      updateTodo(todo.id, { done: toggle.checked });
    });

    editButton.addEventListener("click", () => {
      item.classList.add("is-editing");
      editInput.focus();
      editInput.select();
    });

    saveButton.addEventListener("click", () => {
      submitEdit(todo.id, editInput.value, item);
    });

    editInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        submitEdit(todo.id, editInput.value, item);
      }

      if (event.key === "Escape") {
        item.classList.remove("is-editing");
        editInput.value = todo.text;
      }
    });

    deleteButton.addEventListener("click", () => {
      todos = todos.filter((entry) => entry.id !== todo.id);
      persistAndRender();
    });

    todoList.appendChild(fragment);
  });

  updateStats();
}

function submitEdit(id, nextText, item) {
  const text = nextText.trim();
  if (!text) {
    return;
  }

  updateTodo(id, { text });
  item.classList.remove("is-editing");
}

function updateTodo(id, updates) {
  todos = todos.map((todo) => {
    if (todo.id !== id) {
      return todo;
    }

    return { ...todo, ...updates };
  });

  persistAndRender();
}

function updateStats() {
  const done = todos.filter((todo) => todo.done).length;
  const pending = todos.length - done;

  totalCount.textContent = String(todos.length);
  doneCount.textContent = String(done);
  pendingCount.textContent = String(pending);
}

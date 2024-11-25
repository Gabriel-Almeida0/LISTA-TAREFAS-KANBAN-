// script.js

// Seleção de elementos
const addTaskBtn = document.getElementById('addTaskBtn');
const taskInput = document.getElementById('taskInput');
const kanbanColumns = document.querySelectorAll('.kanban-cards');

// Função para salvar tarefas no localStorage
function saveTasks() {
    const tasks = [];
    kanbanColumns.forEach(column => {
        const status = column.parentElement.getAttribute('data-status');
        const cards = column.querySelectorAll('.kanban-card');
        cards.forEach(card => {
            tasks.push({
                id: card.getAttribute('data-id'),
                content: card.querySelector('.task-content').innerText,
                status: status
            });
        });
    });
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
}

// Função para carregar tarefas do localStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('kanbanTasks')) || [];
    tasks.forEach(task => {
        createTaskElement(task.content, task.status, task.id);
    });
}

// Função para criar um ID único
function generateID() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Função para criar um cartão de tarefa
function createTaskElement(content, status = 'em-aberto', id = null) {
    const card = document.createElement('div');
    card.classList.add('kanban-card');
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', id || generateID());

    const taskContent = document.createElement('span');
    taskContent.classList.add('task-content');
    taskContent.innerText = content;

    const removeBtn = document.createElement('button');
    removeBtn.innerText = 'X';
    removeBtn.addEventListener('click', () => {
        card.remove();
        saveTasks();
    });

    card.appendChild(taskContent);
    card.appendChild(removeBtn);

    // Adicionar eventos de drag and drop
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);

    const column = document.getElementById(status);
    column.appendChild(card);
}

// Evento de adicionar tarefa
addTaskBtn.addEventListener('click', () => {
    const content = taskInput.value.trim();
    if (content === '') {
        alert('Por favor, insira uma tarefa.');
        return;
    }
    createTaskElement(content);
    taskInput.value = '';
    saveTasks();
});

// Eventos de Drag and Drop
let draggedCard = null;

function dragStart(e) {
    draggedCard = this;
    setTimeout(() => {
        this.classList.add('dragging');
    }, 0);
}

function dragEnd() {
    this.classList.remove('dragging');
    draggedCard = null;
    saveTasks();
}

// Adicionar eventos de drag nas colunas
kanbanColumns.forEach(column => {
    column.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(column, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            column.appendChild(draggedCard);
        } else {
            column.insertBefore(draggedCard, afterElement);
        }
    });

    column.addEventListener('drop', (e) => {
        e.preventDefault();
        saveTasks();
    });
});

// Função para determinar a posição do cartão durante o drag
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Carregar tarefas ao iniciar
window.onload = loadTasks;

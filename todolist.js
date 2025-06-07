// Initialize variables
        const form = document.getElementById('todoForm');
        const todoInput = document.getElementById('todoInput');
        const todoList = document.getElementById('todoList');
        const totalTasksEl = document.getElementById('total-tasks');
        const completedTasksEl = document.getElementById('completed-tasks');
        const pendingTasksEl = document.getElementById('pending-tasks');
        const overdueTasksEl = document.getElementById('overdue-tasks');
        const particlesContainer = document.getElementById('particles');
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const categoryFilter = document.getElementById('category-filter');
        const priorityFilter = document.getElementById('priority-filter');
        const statusFilter = document.getElementById('status-filter');
        const taskCategory = document.getElementById('task-category');
        const taskPriority = document.getElementById('task-priority');
        const taskDate = document.getElementById('task-date');
        const productivityTip = document.getElementById('productivity-tip');
        const exportBtn = document.getElementById('exportBtn');
        const quickAddBtn = document.getElementById('quickAddBtn');
        const suggestionsContainer = document.getElementById('suggestions-container');
        const calendarEl = document.getElementById('calendar');
        
        let todos = [];
        let filteredTodos = [];
        let draggedItem = null;
        let analyticsChart = null;

        // Productivity tips
        const tips = [
            "Break large tasks into smaller, manageable steps",
            "Prioritize your tasks using the Eisenhower Matrix",
            "Use the Pomodoro Technique for better focus",
            "Schedule time for deep work without distractions",
            "Review and plan your next day the night before",
            "Set specific, measurable, achievable goals",
            "Take regular breaks to maintain productivity",
            "Learn to say no to non-essential tasks",
            "Group similar tasks together for efficiency",
            "Celebrate your accomplishments, no matter how small"
        ];

        // AI Suggestions
        const suggestions = [
            { text: "Schedule a team meeting for project update", category: "work", priority: "medium" },
            { text: "Plan your weekly grocery shopping", category: "shopping", priority: "low" },
            { text: "Set aside time for a workout session", category: "health", priority: "medium" },
            { text: "Review your monthly budget", category: "personal", priority: "high" },
            { text: "Backup important files and documents", category: "work", priority: "medium" }
        ];

        // Create particle background
        function createParticles() {
            const particleCount = 30;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                // Random size
                const size = Math.random() * 5 + 2;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                // Random position
                particle.style.left = `${Math.random() * 100}vw`;
                particle.style.top = `${Math.random() * 100}vh`;
                
                // Random animation duration
                const duration = Math.random() * 20 + 10;
                particle.style.animationDuration = `${duration}s`;
                
                // Random delay
                const delay = Math.random() * 5;
                particle.style.animationDelay = `${delay}s`;
                
                particlesContainer.appendChild(particle);
            }
        }

        // Get a random productivity tip
        function getRandomTip() {
            const randomIndex = Math.floor(Math.random() * tips.length);
            return tips[randomIndex];
        }

        // Initialize app
        function init() {
            createParticles();
            loadTodos();
            updateStats();
            updateProductivityTip();
            generateCalendar();
            renderAISuggestions();
            initAnalyticsChart();
            setupDragAndDrop();
            
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            taskDate.value = today;
            
            // Form submit event
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const value = todoInput.value.trim();
                
                if (value) {
                    addTodo(value);
                    todoInput.value = '';
                    todoInput.focus();
                }
            });
            
            // Search functionality
            searchBtn.addEventListener('click', filterTodos);
            searchInput.addEventListener('input', filterTodos);
            
            // Filter functionality
            categoryFilter.addEventListener('change', filterTodos);
            priorityFilter.addEventListener('change', filterTodos);
            statusFilter.addEventListener('change', filterTodos);
            
            // Export functionality
            exportBtn.addEventListener('click', exportTasks);
            
            // Quick add button
            quickAddBtn.addEventListener('click', () => {
                todoInput.focus();
                todoInput.scrollIntoView({ behavior: 'smooth' });
            });
            
            // Set interval to update productivity tip every 15 seconds
            setInterval(updateProductivityTip, 15000);
        }

        // Update productivity tip
        function updateProductivityTip() {
            productivityTip.textContent = getRandomTip();
        }

        // Load todos from localStorage
        function loadTodos() {
            const storedTodos = localStorage.getItem('todos');
            if (storedTodos) {
                todos = JSON.parse(storedTodos);
                filterTodos();
            }
        }

        // Save todos to localStorage
        function saveTodos() {
            localStorage.setItem('todos', JSON.stringify(todos));
            updateStats();
            updateCalendar();
            updateAnalyticsChart();
        }

        // Add new todo
        function addTodo(text) {
            const dueDate = taskDate.value;
            const today = new Date().toISOString().split('T')[0];
            
            const newTodo = {
                id: Date.now(),
                text,
                completed: false,
                category: taskCategory.value,
                priority: taskPriority.value,
                dueDate: dueDate || today,
                timestamp: new Date().toISOString()
            };
            
            todos.push(newTodo);
            saveTodos();
            filterTodos();
        }

        // Toggle todo completion
        function toggleTodo(id) {
            todos = todos.map(todo => {
                if (todo.id === id) {
                    return { ...todo, completed: !todo.completed };
                }
                return todo;
            });
            
            saveTodos();
            filterTodos();
            
            // Check if all tasks are completed
            if (todos.length > 0 && todos.every(todo => todo.completed)) {
                showCelebration();
            }
        }

        // Delete todo
        function deleteTodo(id) {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            filterTodos();
        }

        // Edit todo
        function editTodo(id) {
            const todo = todos.find(t => t.id === id);
            if (!todo) return;
            
            const newText = prompt("Edit task:", todo.text);
            if (newText !== null && newText.trim() !== "") {
                todo.text = newText.trim();
                saveTodos();
                filterTodos();
            }
        }

        // Update stats
        function updateStats() {
            totalTasksEl.textContent = todos.length;
            const completed = todos.filter(todo => todo.completed).length;
            completedTasksEl.textContent = completed;
            pendingTasksEl.textContent = todos.length - completed;
            
            // Calculate overdue tasks
            const today = new Date();
            const overdue = todos.filter(todo => {
                if (!todo.completed && todo.dueDate) {
                    const dueDate = new Date(todo.dueDate);
                    return dueDate < today;
                }
                return false;
            }).length;
            
            overdueTasksEl.textContent = overdue;
        }

        // Filter todos based on search and filters
        function filterTodos() {
            const searchTerm = searchInput.value.toLowerCase();
            const category = categoryFilter.value;
            const priority = priorityFilter.value;
            const status = statusFilter.value;
            
            filteredTodos = todos.filter(todo => {
                // Search filter
                if (searchTerm && !todo.text.toLowerCase().includes(searchTerm)) {
                    return false;
                }
                
                // Category filter
                if (category !== 'all' && todo.category !== category) {
                    return false;
                }
                
                // Priority filter
                if (priority !== 'all' && todo.priority !== priority) {
                    return false;
                }
                
                // Status filter
                if (status === 'completed' && !todo.completed) {
                    return false;
                }
                if (status === 'pending' && todo.completed) {
                    return false;
                }
                
                return true;
            });
            
            renderTodos();
        }

        // Render todos
        function renderTodos() {
            if (filteredTodos.length === 0) {
                todoList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-tasks"></i>
                        <h3>No tasks found</h3>
                        <p>Try changing your filters or add a new task</p>
                    </div>
                `;
                return;
            }
            
            todoList.innerHTML = '';
            
            // Sort todos by priority and due date
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            const sortedTodos = [...filteredTodos].sort((a, b) => {
                // Sort by priority first
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                
                // Then by due date
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
                
                return 0;
            });
            
            sortedTodos.forEach(todo => {
                const today = new Date();
                const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
                const isOverdue = dueDate && dueDate < today && !todo.completed;
                
                const todoItem = document.createElement('li');
                todoItem.className = `todo-item ${todo.priority}-priority ${isOverdue ? 'overdue' : ''}`;
                todoItem.draggable = true;
                todoItem.dataset.id = todo.id;
                
                todoItem.innerHTML = `
                    <button class="todo-btn complete-btn" onclick="toggleTodo(${todo.id})">
                        <i class="fas fa-${todo.completed ? 'check-circle' : 'circle'}"></i>
                    </button>
                    <div>
                        <span class="todo-text ${todo.completed ? 'done' : ''}">${todo.text}</span>
                        <div class="todo-meta">
                            <span class="category">${todo.category}</span>
                            <span class="priority ${todo.priority}">${todo.priority}</span>
                            ${dueDate ? `<span class="due-date"><i class="far fa-calendar"></i> ${dueDate.toDateString()}</span>` : ''}
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button class="todo-btn edit-btn" onclick="editTodo(${todo.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="todo-btn delete-btn" onclick="deleteTodo(${todo.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                todoList.appendChild(todoItem);
            });
        }

        // Initialize drag and drop
        function setupDragAndDrop() {
            todoList.addEventListener('dragstart', function(e) {
                if (e.target.tagName === 'LI') {
                    draggedItem = e.target;
                    setTimeout(() => e.target.style.opacity = '0.4', 0);
                }
            });
            
            todoList.addEventListener('dragend', function(e) {
                if (e.target.tagName === 'LI') {
                    setTimeout(() => e.target.style.opacity = '1', 0);
                    draggedItem = null;
                }
            });
            
            todoList.addEventListener('dragover', function(e) {
                e.preventDefault();
                if (draggedItem && e.target.tagName === 'LI') {
                    const rect = e.target.getBoundingClientRect();
                    const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                    todoList.insertBefore(draggedItem, next ? e.target.nextSibling : e.target);
                }
            });
            
            todoList.addEventListener('dragenter', function(e) {
                e.preventDefault();
                if (e.target.tagName === 'LI') {
                    e.target.style.backgroundColor = 'rgba(0, 255, 255, 0.1)';
                }
            });
            
            todoList.addEventListener('dragleave', function(e) {
                if (e.target.tagName === 'LI') {
                    e.target.style.backgroundColor = '';
                }
            });
            
            todoList.addEventListener('drop', function(e) {
                e.preventDefault();
                if (e.target.tagName === 'LI') {
                    e.target.style.backgroundColor = '';
                    
                    // Update todos order
                    const newOrder = Array.from(todoList.children).map(li => parseInt(li.dataset.id));
                    todos.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
                    saveTodos();
                }
            });
        }

        // Generate calendar
        function generateCalendar() {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            // Add day headers
            days.forEach(day => {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-header';
                dayEl.textContent = day;
                calendarEl.appendChild(dayEl);
            });
            
            // Add days (dummy data for demonstration)
            const today = new Date();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            
            for (let i = 1; i <= daysInMonth; i++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day';
                dayEl.textContent = i;
                
                if (i === today.getDate()) {
                    dayEl.classList.add('today');
                }
                
                // Randomly mark some days as having tasks
                if (Math.random() > 0.7) {
                    dayEl.classList.add('has-tasks');
                }
                
                calendarEl.appendChild(dayEl);
            }
        }

        // Update calendar based on tasks
        function updateCalendar() {
            // This would update the calendar with actual task due dates
            // For simplicity, we'll just update the "has-tasks" class
            const dayElements = calendarEl.querySelectorAll('.calendar-day');
            dayElements.forEach(dayEl => {
                dayEl.classList.remove('has-tasks');
                if (Math.random() > 0.7) {
                    dayEl.classList.add('has-tasks');
                }
            });
        }

        // Render AI suggestions
        function renderAISuggestions() {
            suggestionsContainer.innerHTML = '';
            
            suggestions.forEach(suggestion => {
                const suggestionEl = document.createElement('div');
                suggestionEl.className = 'suggestion';
                suggestionEl.innerHTML = `
                    <div class="suggestion-text">${suggestion.text}</div>
                    <div class="suggestion-meta">
                        <span class="category">${suggestion.category}</span>
                        <span class="priority ${suggestion.priority}">${suggestion.priority}</span>
                    </div>
                `;
                
                suggestionEl.addEventListener('click', () => {
                    // Add suggestion as a new task
                    const newTodo = {
                        id: Date.now(),
                        text: suggestion.text,
                        completed: false,
                        category: suggestion.category,
                        priority: suggestion.priority,
                        dueDate: new Date().toISOString().split('T')[0],
                        timestamp: new Date().toISOString()
                    };
                    
                    todos.push(newTodo);
                    saveTodos();
                    filterTodos();
                    
                    // Show confirmation
                    suggestionEl.innerHTML = `<div class="suggestion-text"><i class="fas fa-check"></i> Task added!</div>`;
                    setTimeout(() => {
                        renderAISuggestions();
                    }, 1500);
                });
                
                suggestionsContainer.appendChild(suggestionEl);
            });
        }

        // Initialize analytics chart
        function initAnalyticsChart() {
            const ctx = document.getElementById('analyticsChart').getContext('2d');
            analyticsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Tasks Completed',
                        data: [12, 19, 15, 17, 22, 10, 14],
                        borderColor: '#00ff9d',
                        backgroundColor: 'rgba(0, 255, 157, 0.1)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            });
        }

        // Update analytics chart
        function updateAnalyticsChart() {
            // This would update with real data
            // For demo, we'll just generate random data
            if (analyticsChart) {
                analyticsChart.data.datasets[0].data = Array(7).fill().map(() => Math.floor(Math.random() * 20) + 5);
                analyticsChart.update();
            }
        }

        // Export tasks
        function exportTasks() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todos, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "nexus-tasks.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            // Show confirmation
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = `<i class="fas fa-check"></i> <span>Exported</span>`;
            setTimeout(() => {
                exportBtn.innerHTML = originalText;
            }, 2000);
        }

        // Celebration effect
        function showCelebration() {
            const container = document.querySelector('.container');
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.position = 'absolute';
            confetti.style.top = '0';
            confetti.style.left = '0';
            confetti.style.width = '100%';
            confetti.style.height = '100%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '1000';
            
            for (let i = 0; i < 150; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '10px';
                particle.style.height = '10px';
                particle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
                particle.style.borderRadius = '50%';
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.animation = `confetti-fall ${1 + Math.random() * 3}s linear forwards`;
                confetti.appendChild(particle);
            }
            
            container.appendChild(confetti);
            
            setTimeout(() => {
                container.removeChild(confetti);
            }, 3000);
        }

        // Add confetti animation to styles
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes confetti-fall {
                0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);
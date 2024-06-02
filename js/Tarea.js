document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://127.0.0.1:8000/api';
    
    const loadEmployees = () => {
        fetch(`${apiBaseUrl}/empleados`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar empleados: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    const employeeSelect = document.getElementById('employee');
                    const filterEmployeeSelect = document.getElementById('filter-employee');
                    employeeSelect.innerHTML = '<option value="">Seleccione Responsable</option>';
                    filterEmployeeSelect.innerHTML = '<option value="">Filtrar por Responsable</option>';
                    data.forEach(employee => {
                        const option = document.createElement('option');
                        option.value = employee.id;
                        option.textContent = employee.nombre;
                        employeeSelect.appendChild(option);
                        filterEmployeeSelect.appendChild(option.cloneNode(true));
                    });
                } else {
                    console.error('Error al cargar empleados: La respuesta del servidor no es un array');
                }
            })
            .catch(error => console.error('Error al cargar empleados:', error));
    };



    const loadTasks = () => {
        fetch(`${apiBaseUrl}/tareas`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar tareas: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data.data)) {
                    const tasksTableBody = document.getElementById('tasks-table-body');
                    if (tasksTableBody) {
                        tasksTableBody.innerHTML = '';
                        data.data.forEach(task => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                            <td>${task.titulo}</td>
                            <td>${task.descripcion}</td>
                            <td>${task.fechaEstimadaFinalizacion}</td>
                            <td>${task.prioridad.nombre}</td>
                            <td>${task.estado.nombre}</td>
                            <td>${task.empleado.nombre}</td>
                            <td>
                                <button class="edit-button" data-id="${task.id}">Editar</button>
                                <button class="delete-button" data-id="${task.id}">Eliminar</button>
                            </td>
                        `;
                            tasksTableBody.appendChild(row);
                        });
                        addTaskEventListeners();
                    }
                } else {
                    console.error('Error al cargar tareas: La respuesta del servidor no es un array');
                }
            })
            .catch(error => console.error('Error al cargar tareas:', error));
    };





    const addTaskEventListeners = () => {
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', handleEditTask);
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', handleDeleteTask);
        });
    };


    const handleCreateTask = event => {
        event.preventDefault();
        const taskData = {
            titulo: document.getElementById('title').value,
            descripcion: document.getElementById('description').value,
            fechaEstimadaFinalizacion: document.getElementById('estimated-end-date').value,
            creadorTarea: document.getElementById('creator').value,
            idEmpleado: document.getElementById('employee').value,
            idEstado: document.getElementById('status').value,
            idPrioridad: document.getElementById('priority').value,
            observaciones: document.getElementById('observations').value
        };
        fetch(`${apiBaseUrl}/tareas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status !== 201) {
                console.error('Error al crear tarea:', body);
                throw new Error(`Error al crear tarea: ${status} - ${JSON.stringify(body)}`);
            }
            loadTasks();
            document.getElementById('create-task-form').reset();
        })
        .catch(error => console.error(error));
    };
    





    const handleEditTask = event => {
        const taskId = event.target.dataset.id;
        fetch(`${apiBaseUrl}/tareas/${taskId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar tarea: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                // Rellena el formulario con los datos actuales de la tarea
                document.getElementById('title').value = data.titulo;
                document.getElementById('description').value = data.descripcion;
                document.getElementById('estimated-end-date').value = data.fechaEstimadaFinalizacion;
                document.getElementById('creator').value = data.creadorTarea;
                document.getElementById('employee').value = data.idEmpleado;
                document.getElementById('status').value = data.idEstado;
                document.getElementById('priority').value = data.idPrioridad;
                document.getElementById('observations').value = data.observaciones;

                // Cambia el manejador del evento de envío del formulario para actualizar la tarea en lugar de crear una nueva
                document.getElementById('create-task-form').removeEventListener('submit', handleCreateTask);
                document.getElementById('create-task-form').addEventListener('submit', event => {
                    event.preventDefault();
                    const taskData = {
                        titulo: document.getElementById('title').value,
                        descripcion: document.getElementById('description').value,
                        fechaEstimadaFinalizacion: document.getElementById('estimated-end-date').value,
                        creadorTarea: document.getElementById('creator').value,
                        idEmpleado: document.getElementById('employee').value,
                        idEstado: document.getElementById('status').value,
                        idPrioridad: document.getElementById('priority').value,
                        observaciones: document.getElementById('observations').value
                    };
                    fetch(`${apiBaseUrl}/tareas/${taskId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(taskData)
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Error al actualizar tarea: ' + response.statusText);
                            }
                            return response.json();
                        })
                        .then(() => {
                            loadTasks();
                            document.getElementById('create-task-form').reset();

                            // Cambia el manejador del evento de envío del formulario de vuelta a handleCreateTask
                            document.getElementById('create-task-form').removeEventListener('submit', handleUpdateTask);
                            document.getElementById('create-task-form').addEventListener('submit', handleCreateTask);
                        })
                        .catch(error => console.error(error.message));
                }, { once: true });
            })
            .catch(error => console.error('Error al cargar tarea:', error));
    };



    const handleUpdateTask = event => {
        event.preventDefault();
        const taskId = event.target.dataset.id;
        const taskData = {
            titulo: document.getElementById('title').value,
            descripcion: document.getElementById('description').value,
            fechaEstimadaFinalizacion: document.getElementById('estimated-end-date').value,
            creadorTarea: document.getElementById('creator').value,
            idEmpleado: document.getElementById('employee').value,
            idEstado: document.getElementById('status').value,
            idPrioridad: document.getElementById('priority').value,
            observaciones: document.getElementById('observations').value
        };
        fetch(`${apiBaseUrl}/tareas/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al actualizar tarea: ' + response.statusText);
                }
                return response.json();
            })
            .then(() => {
                loadTasks();
                document.getElementById('create-task-form').reset();
                // Cambia el manejador del evento de envío del formulario de vuelta a handleCreateTask
                document.getElementById('create-task-form').removeEventListener('submit', handleUpdateTask);
                document.getElementById('create-task-form').addEventListener('submit', handleCreateTask);
            })
            .catch(error => console.error(error.message));
    };



    const handleDeleteTask = event => {
        const taskId = event.target.dataset.id;
        fetch(`${apiBaseUrl}/tareas/${taskId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al eliminar tarea: ' + response.statusText);
                }
                loadTasks(); // Actualizar la lista de tareas después de eliminar una
            })
            .catch(error => console.error('Error al eliminar tarea:', error));
    };



    const handleFilterTasks = () => {
        const title = document.getElementById('search-title').value;
        const startDate = document.getElementById('filter-start-date').value;
        const endDate = document.getElementById('filter-end-date').value;
        const priority = document.getElementById('filter-priority').value;
        const status = document.getElementById('filter-status').value;
        const employee = document.getElementById('filter-employee').value;
    
        let url = `${apiBaseUrl}/tareas?`;
        if (title) url += `titulo=${title}&`;
        if (startDate) url += `startDate=${startDate}&`;
        if (endDate) url += `endDate=${endDate}&`;
        if (priority) url += `idPrioridad=${priority}&`;
        if (status) url += `idEstado=${status}&`;
        if (employee) url += `idEmpleado=${employee}&`;
    
        fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al filtrar tareas');
            }
            return response.json();
        })
        .then(responseData => {
            const data = responseData.data; // Accedemos a la propiedad 'data' del objeto de respuesta
            const tasksTableBody = document.getElementById('tasks-table-body');
            tasksTableBody.innerHTML = '';
            data.forEach(task => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${task.titulo}</td>
                    <td>${task.descripcion}</td>
                    <td>${task.fechaEstimadaFinalizacion}</td>
                    <td>${task.prioridad.nombre}</td>
                    <td>${task.estado.nombre}</td>
                    <td>${task.empleado.nombre}</td>
                    <td>
                        <button class="edit-button" data-id="${task.id}">Editar</button>
                        <button class="delete-button" data-id="${task.id}">Eliminar</button>
                    </td>
                `;
                tasksTableBody.appendChild(row);
            });
            addTaskEventListeners();
        })
        .catch(error => console.error(error.message));
        
    };

    document.getElementById('create-task-form').addEventListener('submit', handleCreateTask);
    document.getElementById('filter-button').addEventListener('click', handleFilterTasks);

    loadEmployees();
    loadTasks();
});

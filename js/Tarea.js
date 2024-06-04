document.addEventListener('DOMContentLoaded', () => {

    const apiBaseUrl = 'http://127.0.0.1:8000/api';


    // Esta función carga la lista de empleados desde la API y llena los elementos <select> 
    // en el formulario de creación de tareas y en los filtros de búsqueda con las opciones correspondientes.
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

    // Esta función carga la lista de tareas desde la API y muestra estas tareas en una tabla 
    // en la interfaz de usuario. También asigna eventos a los botones de edición y eliminación de cada tarea.

    const loadTasks = () => {
        fetch(`${apiBaseUrl}/tareas`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar tareas: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('El formato de datos es incorrecto. Se esperaba un array.');
                }
                const tasksTableBody = document.getElementById('tasks-table-body');
                tasksTableBody.innerHTML = '';
                data.forEach(task => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${task.titulo}</td>
                        <td>${task.descripcion}</td>
                        <td>${task.fechaEstimadaFinalizacion}</td>
                        <td>${task.prioridad}</td>
                        <td>${task.estado}</td>
                        <td>${task.empleado}</td>
                        <td>
                            <button class="edit-button" data-id="${task.id}">Editar</button>
                            <button class="delete-button" data-id="${task.id}">Eliminar</button>
                        </td>
                    `;
                    tasksTableBody.appendChild(row);
                });
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

    // Esta función maneja el evento de envío del formulario de creación de tareas. 
    // Recopila los datos del formulario, envía una solicitud POST al backend para crear
    //  una nueva tarea y actualiza la lista de tareas después de la creación exitosa.

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



    // Esta función maneja el evento de clic en el botón "Editar" de una tarea específica.
    //  Recupera los detalles de la tarea seleccionada desde la API, muestra esos detalles
    //   en el formulario de creación de tareas y cambia el manejador del evento de envío 
    //   del formulario para actualizar la tarea existente en lugar de crear una nueva.
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
                document.getElementById('title').value = data.titulo;
                document.getElementById('description').value = data.descripcion;
                document.getElementById('estimated-end-date').value = data.fechaEstimadaFinalizacion;
                document.getElementById('creator').value = data.creadorTarea;
                document.getElementById('employee').value = data.idEmpleado;
                document.getElementById('status').value = data.idEstado;
                document.getElementById('priority').value = data.idPrioridad;
                document.getElementById('observations').value = data.observaciones;

                document.getElementById('create-task-form').removeEventListener('submit', handleCreateTask);
                document.getElementById('create-task-form').addEventListener('submit', event => {
                    event.preventDefault();
                    handleUpdateTask(event, taskId);
                }, { once: true });
            })
            .catch(error => console.error('Error al cargar tarea:', error));
    };



    // Esta función maneja el evento de envío del formulario de modificación de tareas.
    //  Recopila los datos del formulario modificado, envía una solicitud PUT al backend
    //   para actualizar la tarea seleccionada con los nuevos datos y actualiza la lista
    //    de tareas después de la actualización exitosa. Esta función se utiliza en el caso
    //     de que el usuario haya hecho clic en el botón "Editar" de una tarea, haya modificado
    //      los detalles de la tarea en el formulario y haya enviado el formulario para actualizar
    //       la tarea existente en lugar de crear una nueva.

    const handleUpdateTask = (event, taskId) => {
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
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status !== 200) {
                    console.error('Error al actualizar tarea:', body);
                    throw new Error(`Error al actualizar tarea: ${status} - ${JSON.stringify(body)}`);
                }
                loadTasks();
                document.getElementById('create-task-form').reset();
                document.getElementById('create-task-form').removeEventListener('submit', handleUpdateTask);
                document.getElementById('create-task-form').addEventListener('submit', handleCreateTask);
            })
            .catch(error => console.error('Error al actualizar tarea:', error));
    };



    // Esta función maneja el evento de clic en el botón "Eliminar" de una tarea específica.
    //  Envía una solicitud DELETE al backend para eliminar la tarea seleccionada y actualiza
    //   la lista de tareas después de la eliminación exitosa.

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


    // Esta función maneja el evento de clic en el botón "Aplicar Filtros". 
    // Recopila los valores de los campos de filtro, construye la URL de la solicitud 
    // GET con esos filtros y envía la solicitud GET al backend para obtener las tareas 
    // filtradas. Luego, actualiza la tabla de tareas con las tareas filtradas.

    // Dentro de la función handleFilterTasks
    // Dentro de la función handleFilterTasks
    // Dentro de la función handleFilterTasks

    const handleFilterTasks = () => {
        const title = document.getElementById('search-title').value;
        const startDate = document.getElementById('filter-start-date').value;
        const endDate = document.getElementById('filter-end-date').value;
        const priority = document.getElementById('filter-priority').value;
        const status = document.getElementById('filter-status').value;
        const employee = document.getElementById('filter-employee').value;
        const orderBy = document.getElementById('order-by').value;

        let url = `${apiBaseUrl}/tareas?`;
        if (title) url += `titulo=${title}&`;
        if (startDate) url += `startDate=${startDate}&`;
        if (endDate) url += `endDate=${endDate}&`;
        if (priority) url += `idPrioridad=${priority}&`;
        if (status) url += `idEstado=${status}&`;
        if (employee) url += `idEmpleado=${employee}&`;
        if (orderBy) url += `order_by=${orderBy}&`;

        fetch(url)
            .then(response => response.json())
            .then(responseData => {
                const tasks = responseData;
                const tasksTableBody = document.getElementById('tasks-table-body');
                tasksTableBody.innerHTML = '';
                const taskData = Array.isArray(tasks) ? tasks : [tasks]; // Manejo de respuesta como objeto o array
                taskData.forEach(task => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${task.titulo}</td>
                    <td>${task.descripcion}</td>
                    <td>${task.fechaEstimadaFinalizacion}</td>
                    <td>${task.prioridad ? task.prioridad.nombre : 'Sin prioridad'}</td> // Verificación de prioridad
                    <td>${task.estado ? task.estado.nombre : 'Sin estado'}</td> // Verificación de estado
                    <td>${task.empleado ? task.empleado.nombre : 'Sin asignar'}</td> // Verificación de empleado
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


    // mostrar las tareas agrupadas por estado:

    // Función para cargar tareas agrupadas por estado
    function loadTasksByStatus() {
        fetch(`${apiBaseUrl}/tareas/agrupadas`)
            .then(response => response.json())
            .then(responseData => {
                const tasksByStatus = responseData.tasks_by_status;

                // Limpiar las listas de tareas
                document.querySelector('#tasks-pendientes ul').innerHTML = '';
                document.querySelector('#tasks-en-proceso ul').innerHTML = '';
                document.querySelector('#tasks-terminadas ul').innerHTML = '';
                document.querySelector('#tasks-en-impedimento ul').innerHTML = '';

                // Verificar si cada categoría de estado existe antes de iterar sobre ellas
                if (tasksByStatus['Pendiente']) {
                    tasksByStatus['Pendiente'].forEach(task => {
                        const li = document.createElement('li');
                        li.textContent = task.titulo;
                        document.querySelector('#tasks-pendientes ul').appendChild(li);
                    });
                }

                if (tasksByStatus['En Proceso']) {
                    tasksByStatus['En Proceso'].forEach(task => {
                        const li = document.createElement('li');
                        li.textContent = task.titulo;
                        document.querySelector('#tasks-en-proceso ul').appendChild(li);
                    });
                }

                if (tasksByStatus['Terminada']) {
                    tasksByStatus['Terminada'].forEach(task => {
                        const li = document.createElement('li');
                        li.textContent = task.titulo;
                        document.querySelector('#tasks-terminadas ul').appendChild(li);
                    });
                }

                if (tasksByStatus['En Impedimento']) {
                    tasksByStatus['En Impedimento'].forEach(task => {
                        const li = document.createElement('li');
                        li.textContent = task.titulo;
                        document.querySelector('#tasks-en-impedimento ul').appendChild(li);
                    });
                }
            })
            .catch(error => console.error('Error al cargar tareas agrupadas por estado:', error));
    }

    loadTasksByStatus();
    addTaskEventListeners();

    document.addEventListener('DOMContentLoaded', () => {
        loadTasksByStatus();
    });



    // Event listeners
    document.getElementById('filter-button').addEventListener('click', handleFilterTasks);
    document.getElementById('create-task-form').addEventListener('submit', handleCreateTask);

    // Llamada a addTaskEventListeners fuera del evento DOMContentLoaded
       // Carga inicial de tareas y empleados
    loadTasks();
    loadEmployees();
    loadTasksByStatus();
    addTaskEventListeners();



});


// Jhonathan Uni sisa 55222510
// Obtener todas las tareas
fetch("http://127.0.0.1:8000/api/tareas")
  .then(response => response.json())
  .then(data => {
    console.log(data); // Aquí puedes manejar los datos de las tareas
  })
  .catch(error => console.error('Error al cargar tareas:', error));


// Obtener una tarea específica por su ID
fetch("http://127.0.0.1:8000/api/tareas/{id}") // Reemplaza {id} con el ID de la tarea específica
  .then(response => response.json())
  .then(data => {
    console.log(data); // Aquí puedes manejar los datos de la tarea específica
  })
  .catch(error => console.error('Error al cargar tarea:', error));

  
// Crear una nueva tarea
fetch("http://127.0.0.1:8000/api/tareas", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    // Datos de la nueva tarea
    título: "Título de la nueva tarea",
    descripción: "Descripción de la nueva tarea",
    fechaEstimadaFinalizacion: "2024-06-01",
    creadorTarea: "Creador de la nueva tarea",
    IdEmpleado: 1, // ID del empleado asignado a la tarea
    IdEstado: 1, // ID del estado de la tarea
    IdPrioridad: 1, // ID de la prioridad de la tarea
    observaciones: "Observaciones de la nueva tarea"
  })
})
.then(response => response.json())
.then(data => {
  console.log("Tarea creada:", data);
})
.catch(error => console.error('Error al crear tarea:', error));

// Actualizar una tarea existente
fetch("http://127.0.0.1:8000/api/tareas/{id}", { // Reemplaza {id} con el ID de la tarea a actualizar
  method: "PUT",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    // Datos actualizados de la tarea
    título: "Nuevo título de la tarea",
    descripción: "Nueva descripción de la tarea",
    fechaEstimadaFinalizacion: "2024-06-02",
    // Otros campos a actualizar según sea necesario
  })
})
.then(response => response.json())
.then(data => {
  console.log("Tarea actualizada:", data);
})
.catch(error => console.error('Error al actualizar tarea:', error));

// Eliminar una tarea existente
fetch("http://127.0.0.1:8000/api/tareas/{id}", { // Reemplaza {id} con el ID de la tarea a eliminar
  method: "DELETE"
})
.then(() => {
  console.log("Tarea eliminada");
})
.catch(error => console.error('Error al eliminar tarea:', error));

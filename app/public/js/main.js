const movementTable = document.querySelector('movement-table')
const addMovementForm = document.querySelector('add-movement-form')

addMovementForm.addEventListener('onAdd', movementTable.handleAddMovement);
movementTable.updateTable();
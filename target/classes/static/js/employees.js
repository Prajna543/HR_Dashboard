document.addEventListener('DOMContentLoaded', () => {
  const employeeBody = document.getElementById('employeeBody');
  const searchNameInput = document.getElementById('searchName');

  async function fetchEmployees() {
    try {
      const res = await fetch('/employees');
      const employees = await res.json();
      displayEmployees(employees);
    } catch (err) {
      alert('Failed to load employees. Please try again.');
      console.error(err);
    }
  }

  function displayEmployees(employees) {
    employeeBody.innerHTML = '';
    employees.forEach(emp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${emp.name || ''}</td>
        <td>${emp.email ? emp.email.trim() : ''}</td>
        <td>${emp.department || ''}</td>
        <td>${emp.status || ''}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1">View</button>
          <button class="btn btn-sm btn-warning me-1">Reset</button>
          <button class="btn btn-sm btn-secondary">Edit</button>
        </td>
      `;
      employeeBody.appendChild(tr);
    });
  }

  // Simple search filter by name
  searchNameInput.addEventListener('input', () => {
    const filter = searchNameInput.value.toLowerCase();
    Array.from(employeeBody.children).forEach(row => {
      const name = row.children[0].textContent.toLowerCase();
      row.style.display = name.includes(filter) ? '' : 'none';
    });
  });

  fetchEmployees();
});

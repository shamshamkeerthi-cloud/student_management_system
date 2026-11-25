// ---------- 1. Get references to HTML elements ----------
const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchInput");
const totalStudents = document.getElementById("totalStudents");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

const idInput = document.getElementById("studentId");
const nameInput = document.getElementById("studentName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const departmentInput = document.getElementById("department");

// When editing, this holds the ID of the student being edited
let editingId = null;

// ---------- 2. LocalStorage helpers ----------
function getStudents() {
  // Read the saved text and convert it back to an array
  return JSON.parse(localStorage.getItem("students")) || [];
}

function saveStudents(students) {
  // Convert the array to text and store it
  localStorage.setItem("students", JSON.stringify(students));
}

// ---------- 3. Show students in the table ----------
function displayStudents() {
  const students = getStudents();
  const searchText = searchInput.value.trim().toLowerCase();

  // Keep only students whose name matches the search text
  const filtered = students.filter(function (student) {
    return student.name.toLowerCase().includes(searchText);
  });

  // Total count (all students, not just filtered)
  totalStudents.textContent = students.length;

  // Clear old rows
  tableBody.innerHTML = "";

  if (filtered.length === 0) {
    tableBody.innerHTML =
      '<tr class="empty-row"><td colspan="7">No students found</td></tr>';
    return;
  }

  // Create one row per student
  filtered.forEach(function (student) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(student.id)}</td>
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.phone)}</td>
      <td>${escapeHtml(student.department)}</td>
      <td>${escapeHtml(student.gender)}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning me-1" onclick="editStudent('${escapeHtml(student.id)}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteStudent('${escapeHtml(student.id)}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Prevents users from injecting HTML into the table
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

// ---------- 4. Save (add or update) a student ----------
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const student = {
    id: idInput.value.trim(),
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    department: departmentInput.value,
    gender: document.querySelector('input[name="gender"]:checked').value
  };

  const students = getStudents();

  if (editingId === null) {
    // ADD mode: make sure the ID is not already used
    const exists = students.some(function (s) {
      return s.id === student.id;
    });
    if (exists) {
      alert("A student with this ID already exists!");
      return;
    }
    students.push(student);
  } else {
    // EDIT mode: replace the old student with the updated one
    const index = students.findIndex(function (s) {
      return s.id === editingId;
    });
    students[index] = student;
  }

  saveStudents(students);
  resetForm();
  displayStudents();
});

// ---------- 5. Edit a student ----------
function editStudent(id) {
  const student = getStudents().find(function (s) {
    return s.id === id;
  });

  // Fill the form with the student's details
  idInput.value = student.id;
  nameInput.value = student.name;
  emailInput.value = student.email;
  phoneInput.value = student.phone;
  departmentInput.value = student.department;
  document.querySelector(`input[name="gender"][value="${student.gender}"]`).checked = true;

  // Switch the form to edit mode
  editingId = id;
  idInput.readOnly = true; // ID cannot be changed
  saveBtn.textContent = "Update Student";
  formTitle.textContent = "Edit Student";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- 6. Delete a student ----------
function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) {
    return;
  }

  // Keep every student except the one being deleted
  const students = getStudents().filter(function (s) {
    return s.id !== id;
  });

  saveStudents(students);

  // If we were editing this student, clear the form
  if (editingId === id) {
    resetForm();
  }
  displayStudents();
}

// ---------- 7. Reset the form ----------
function resetForm() {
  form.reset();
  editingId = null;
  idInput.readOnly = false;
  saveBtn.textContent = "Save Student";
  formTitle.textContent = "Student Registration";
}

cancelBtn.addEventListener("click", resetForm);

// ---------- 8. Search while typing ----------
searchInput.addEventListener("input", displayStudents);

// ---------- 9. Show saved students when the page loads ----------
displayStudents();

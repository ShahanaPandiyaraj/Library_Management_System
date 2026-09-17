const API = "/api";

// ---------- Tab switching ----------
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "issues") loadIssueDropdowns();
  });
});

function showMsg(elId, text, isError) {
  const el = document.getElementById(elId);
  el.textContent = text;
  el.className = "msg " + (isError ? "error" : "success");
  setTimeout(() => { el.textContent = ""; el.className = "msg"; }, 4000);
}

async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }
  if (!res.ok) {
    const detail = data ? JSON.stringify(data) : `HTTP ${res.status}`;
    throw new Error(detail);
  }
  return data;
}

// ---------- BOOKS ----------
const bookForm = document.getElementById("bookForm");
const bookSubmitBtn = document.getElementById("bookSubmitBtn");
const bookCancelBtn = document.getElementById("bookCancelBtn");

async function loadBooks(query = "") {
  try {
    const url = query ? `${API}/books/?search=${encodeURIComponent(query)}` : `${API}/books/`;
    const books = await apiRequest(url);
    const tbody = document.getElementById("bookTableBody");
    tbody.innerHTML = "";
    books.forEach(b => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="Title">${escapeHtml(b.title)}</td>
        <td data-label="Author">${escapeHtml(b.author)}</td>
        <td data-label="ISBN">${escapeHtml(b.isbn)}</td>
        <td data-label="Category">${escapeHtml(b.category)}</td>
        <td data-label="Available">${b.available_copies}</td>
        <td data-label="Total">${b.total_copies}</td>
        <td data-label="Actions">
          <button class="action-btn edit-btn" onclick="editBook(${b.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteBook(${b.id})">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showMsg("bookMsg", "Failed to load books: " + err.message, true);
  }
}

bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("bookId").value;
  const payload = {
    title: document.getElementById("bookTitle").value.trim(),
    author: document.getElementById("bookAuthor").value.trim(),
    isbn: document.getElementById("bookIsbn").value.trim(),
    category: document.getElementById("bookCategory").value,
    total_copies: parseInt(document.getElementById("bookTotal").value, 10),
    available_copies: parseInt(document.getElementById("bookAvailable").value, 10),
  };
  try {
    if (id) {
      await apiRequest(`${API}/books/${id}/`, { method: "PUT", body: JSON.stringify(payload) });
      showMsg("bookMsg", "Book updated successfully.", false);
    } else {
      await apiRequest(`${API}/books/`, { method: "POST", body: JSON.stringify(payload) });
      showMsg("bookMsg", "Book added successfully.", false);
    }
    resetBookForm();
    loadBooks();
  } catch (err) {
    showMsg("bookMsg", "Error: " + err.message, true);
  }
});

async function editBook(id) {
  try {
    const b = await apiRequest(`${API}/books/${id}/`);
    document.getElementById("bookId").value = b.id;
    document.getElementById("bookTitle").value = b.title;
    document.getElementById("bookAuthor").value = b.author;
    document.getElementById("bookIsbn").value = b.isbn;
    document.getElementById("bookCategory").value = b.category;
    document.getElementById("bookTotal").value = b.total_copies;
    document.getElementById("bookAvailable").value = b.available_copies;
    bookSubmitBtn.textContent = "Update Book";
    bookCancelBtn.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    showMsg("bookMsg", "Error: " + err.message, true);
  }
}

async function deleteBook(id) {
  if (!confirm("Delete this book permanently?")) return;
  try {
    await apiRequest(`${API}/books/${id}/`, { method: "DELETE" });
    showMsg("bookMsg", "Book deleted.", false);
    loadBooks();
  } catch (err) {
    showMsg("bookMsg", "Error: " + err.message, true);
  }
}

bookCancelBtn.addEventListener("click", resetBookForm);
function resetBookForm() {
  bookForm.reset();
  document.getElementById("bookId").value = "";
  document.getElementById("bookTotal").value = 1;
  document.getElementById("bookAvailable").value = 1;
  bookSubmitBtn.textContent = "Add Book";
  bookCancelBtn.classList.add("hidden");
}

let bookSearchTimer;
document.getElementById("bookSearch").addEventListener("input", (e) => {
  clearTimeout(bookSearchTimer);
  bookSearchTimer = setTimeout(() => loadBooks(e.target.value.trim()), 300);
});

// ---------- MEMBERS ----------
const memberForm = document.getElementById("memberForm");
const memberSubmitBtn = document.getElementById("memberSubmitBtn");
const memberCancelBtn = document.getElementById("memberCancelBtn");

async function loadMembers(query = "") {
  try {
    const url = query ? `${API}/members/?search=${encodeURIComponent(query)}` : `${API}/members/`;
    const members = await apiRequest(url);
    const tbody = document.getElementById("memberTableBody");
    tbody.innerHTML = "";
    members.forEach(m => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="Name">${escapeHtml(m.name)}</td>
        <td data-label="Email">${escapeHtml(m.email)}</td>
        <td data-label="Phone">${escapeHtml(m.phone)}</td>
        <td data-label="Joined">${new Date(m.joined_on).toLocaleDateString()}</td>
        <td data-label="Actions">
          <button class="action-btn edit-btn" onclick="editMember(${m.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteMember(${m.id})">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showMsg("memberMsg", "Failed to load members: " + err.message, true);
  }
}

memberForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("memberId").value;
  const payload = {
    name: document.getElementById("memberName").value.trim(),
    email: document.getElementById("memberEmail").value.trim(),
    phone: document.getElementById("memberPhone").value.trim(),
  };
  try {
    if (id) {
      await apiRequest(`${API}/members/${id}/`, { method: "PUT", body: JSON.stringify(payload) });
      showMsg("memberMsg", "Member updated successfully.", false);
    } else {
      await apiRequest(`${API}/members/`, { method: "POST", body: JSON.stringify(payload) });
      showMsg("memberMsg", "Member added successfully.", false);
    }
    resetMemberForm();
    loadMembers();
  } catch (err) {
    showMsg("memberMsg", "Error: " + err.message, true);
  }
});

async function editMember(id) {
  try {
    const m = await apiRequest(`${API}/members/${id}/`);
    document.getElementById("memberId").value = m.id;
    document.getElementById("memberName").value = m.name;
    document.getElementById("memberEmail").value = m.email;
    document.getElementById("memberPhone").value = m.phone;
    memberSubmitBtn.textContent = "Update Member";
    memberCancelBtn.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    showMsg("memberMsg", "Error: " + err.message, true);
  }
}

async function deleteMember(id) {
  if (!confirm("Delete this member permanently?")) return;
  try {
    await apiRequest(`${API}/members/${id}/`, { method: "DELETE" });
    showMsg("memberMsg", "Member deleted.", false);
    loadMembers();
  } catch (err) {
    showMsg("memberMsg", "Error: " + err.message, true);
  }
}

memberCancelBtn.addEventListener("click", resetMemberForm);
function resetMemberForm() {
  memberForm.reset();
  document.getElementById("memberId").value = "";
  memberSubmitBtn.textContent = "Add Member";
  memberCancelBtn.classList.add("hidden");
}

let memberSearchTimer;
document.getElementById("memberSearch").addEventListener("input", (e) => {
  clearTimeout(memberSearchTimer);
  memberSearchTimer = setTimeout(() => loadMembers(e.target.value.trim()), 300);
});

// ---------- ISSUES ----------
async function loadIssueDropdowns() {
  try {
    const [books, members] = await Promise.all([
      apiRequest(`${API}/books/`),
      apiRequest(`${API}/members/`),
    ]);
    const bookSelect = document.getElementById("issueBook");
    const memberSelect = document.getElementById("issueMember");
    bookSelect.innerHTML = books
      .filter(b => b.available_copies > 0)
      .map(b => `<option value="${b.id}">${escapeHtml(b.title)} (${b.available_copies} available)</option>`)
      .join("");
    memberSelect.innerHTML = members
      .map(m => `<option value="${m.id}">${escapeHtml(m.name)}</option>`)
      .join("");
  } catch (err) {
    showMsg("issueMsg", "Failed to load dropdowns: " + err.message, true);
  }
  loadIssues();
}

async function loadIssues() {
  try {
    const issues = await apiRequest(`${API}/issues/`);
    const tbody = document.getElementById("issueTableBody");
    tbody.innerHTML = "";
    issues.forEach(i => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="Book">${escapeHtml(i.book_title)}</td>
        <td data-label="Member">${escapeHtml(i.member_name)}</td>
        <td data-label="Issue Date">${i.issue_date}</td>
        <td data-label="Due Date">${i.due_date}</td>
        <td data-label="Return Date">${i.return_date ? i.return_date : "Not returned"}</td>
        <td data-label="Actions">${i.return_date ? "" : `<button class="action-btn return-btn" onclick="returnBook(${i.id})">Return</button>`}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showMsg("issueMsg", "Failed to load issue records: " + err.message, true);
  }
}

document.getElementById("issueForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    book: parseInt(document.getElementById("issueBook").value, 10),
    member: parseInt(document.getElementById("issueMember").value, 10),
    due_date: document.getElementById("issueDueDate").value,
  };
  try {
    await apiRequest(`${API}/issues/`, { method: "POST", body: JSON.stringify(payload) });
    showMsg("issueMsg", "Book issued successfully.", false);
    document.getElementById("issueForm").reset();
    loadIssueDropdowns();
  } catch (err) {
    showMsg("issueMsg", "Error: " + err.message, true);
  }
});

async function returnBook(id) {
  try {
    await apiRequest(`${API}/issues/${id}/return_book/`, { method: "POST" });
    showMsg("issueMsg", "Book returned successfully.", false);
    loadIssueDropdowns();
  } catch (err) {
    showMsg("issueMsg", "Error: " + err.message, true);
  }
}

// ---------- helpers ----------
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- init ----------
loadBooks();
loadMembers();

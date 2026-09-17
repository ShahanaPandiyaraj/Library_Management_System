# Library Management System

A full-stack CRUD web application built with **Django + Django REST Framework** (backend/API) and **plain HTML, CSS, JavaScript** (frontend) — no Node.js, no build step, single server, zero CORS headaches. Meets every requirement in the CRUD SOP: REST API, database, validation, testing, docs.

## 1. Architecture

```
Browser (HTML/CSS/JS, fetch API)
        |
        v
Django (serves the page + REST API on the same origin)
        |
        v
Django REST Framework (ViewSets, Serializers, Validation)
        |
        v
SQLite database (via Django ORM)
```

## 2. Entities & Relationships

| Model | Fields | Relationship |
|---|---|---|
| `Book` | title, author, isbn (unique), category, total_copies, available_copies, added_on | — |
| `Member` | name, email (unique), phone, joined_on | — |
| `IssueRecord` | book (FK), member (FK), issue_date, due_date, return_date | Many-to-one with Book and Member |

Issuing a book decrements `available_copies`; returning it increments the count back — this is server-side business logic, not just a raw CRUD table.

## 3. Setup & Run

```bash
# 1. Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply database migrations
python manage.py migrate

# 4. (Optional) create an admin user for the Django admin panel
python manage.py createsuperuser

# 5. Run the server
python manage.py runserver
```

Open **http://127.0.0.1:8000/** in a browser — that's the whole app.
Django admin panel: **http://127.0.0.1:8000/admin/**

## 4. REST API Reference

| Operation | Method | Endpoint | Notes |
|---|---|---|---|
| List/Search books | GET | `/api/books/?search=<text>` | searches title, author, isbn, category |
| Create book | POST | `/api/books/` | |
| Retrieve book | GET | `/api/books/{id}/` | |
| Update book | PUT | `/api/books/{id}/` | |
| Delete book | DELETE | `/api/books/{id}/` | |
| List/Search members | GET | `/api/members/?search=<text>` | |
| Create member | POST | `/api/members/` | |
| Update member | PUT | `/api/members/{id}/` | |
| Delete member | DELETE | `/api/members/{id}/` | |
| List issue records | GET | `/api/issues/` | |
| Issue a book | POST | `/api/issues/` | body: `{book, member, due_date}` |
| Return a book | POST | `/api/issues/{id}/return_book/` | |

### Sample request bodies (for Postman)

Create book:
```json
{"title":"Clean Code","author":"Robert Martin","isbn":"9780132350884","category":"SCI","total_copies":3,"available_copies":3}
```

Create member:
```json
{"name":"Hana","email":"hana@example.com","phone":"9876543210"}
```

Issue a book:
```json
{"book":1,"member":1,"due_date":"2026-09-30"}
```

## 5. Validation implemented (client + server)

- Required fields cannot be empty (HTML5 `required` + Django field constraints).
- ISBN and email are unique — duplicates return `400` with a clear message.
- ISBN must be 10 or 13 digits; phone must be exactly 10 digits (regex validators).
- `available_copies` can never exceed `total_copies` (serializer-level check).
- Issuing a book with zero `available_copies` is rejected with `400`.
- Returning an already-returned book is rejected with `400`.

## 6. Testing performed

Every endpoint was exercised end-to-end with `curl` before delivery:
- Create/list/retrieve/update/delete for Books and Members — all pass.
- Issue → available_copies decremented correctly.
- Return → available_copies incremented back correctly.
- Invalid phone (too short) → `400` with field error.
- Duplicate ISBN → `400` with field error.
- Search filter on both Books and Members — verified.
- `python manage.py check` → **0 issues**.

For your submission, repeat this in Postman and screenshot each response for the report.

## 7. Project Structure

```
librarysystem/
├── manage.py
├── requirements.txt
├── librarysystem/          # project settings, root urls
├── catalog/                # the app: models, serializers, views, urls, admin
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   ├── templates/catalog/index.html
│   └── static/catalog/{style.css, script.js}
```

## 8. Future Enhancements (for your report's "Future Enhancements" section)

- User authentication (librarian login) with role-based permissions.
- Fine calculation for overdue returns.
- Pagination for large book catalogs.
- Email/SMS notifications before due dates.
- Barcode/QR scanning for faster issue-return at the counter.

## 9. Git Workflow (for submission)

```bash
git init
git add .
git commit -m "Initial commit: Library Management System CRUD app"
git remote add origin <your-repo-url>
git push -u origin main
```

`.gitignore` already excludes `db.sqlite3`, `__pycache__`, and virtual environments.

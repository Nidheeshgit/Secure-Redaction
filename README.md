# Secure-Redaction

# 🔒 AI-Powered File Redaction System

A secure Flask-based web application that automatically detects and redacts sensitive information from PDF and DOCX documents. The application provides user authentication, secure file uploads, document processing, and downloadable redacted files through an intuitive web interface.

---

## 📌 Features

- 🔐 User Registration & Login Authentication
- 📄 Upload PDF and DOCX Documents
- ✂️ Automatic Sensitive Data Redaction
- 💾 Download Redacted Documents
- 🗄️ SQLite Database Integration
- 🔒 Secure Password Hashing
- 📁 File Upload Validation
- ⚡ Responsive User Interface
- ☁️ Cloud Deployment on PythonAnywhere
- 🤖 Selenium Automation Testing

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- Flask

### Database
- SQLite

### Python Libraries
- Flask
- PyMuPDF (fitz)
- python-docx
- Werkzeug

### Testing
- Selenium

### Deployment
- PythonAnywhere

---

## 📂 Project Structure

```
file_redaction_app/
│
├── app.py
├── requirements.txt
├── database.db
├── templates/
├── static/
├── uploads/
├── redacted_files/
├── utils/
└── README.md
```

---

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/Nidheeshgit/Secure-Redaction.git
cd Secure-Redaction
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run the Application

```bash
python app.py
```

The application will be available at:

```
http://127.0.0.1:5000
```

---

## 🌐 Live Demo

**PythonAnywhere Deployment**

```
https://nidheesh.pythonanywhere.com
```

---

## 📖 How It Works

1. Register or log in to the application.
2. Upload a supported document (PDF or DOCX).
3. The application processes the document and redacts sensitive information.
4. Download the generated redacted document.

---

## 🤖 Automated Testing

The application includes Selenium-based automated tests to verify:

- Login functionality
- Authentication flow
- File upload process
- Navigation between pages
- End-to-end workflow validation

Run Selenium tests using:

```bash
python test_login.py
```

---

## 🔐 Security Features

- Password Hashing
- Session Management
- File Type Validation
- Secure File Upload Handling
- Authentication-Protected Routes



## 📈 Future Improvements

- AI-powered Named Entity Recognition (NER) for smarter redaction
- OCR support for scanned PDF documents
- User dashboard with document history
- Email notifications after processing
- Cloud storage integration
- Admin panel for user management
- REST API for third-party integrations

---

## 👨‍💻 Author

**Nidheesh Reddy**

- GitHub: https://github.com/Nidheeshgit

---

## 📄 License

This project is licensed under the MIT License.

---

⭐ If you found this project useful, consider giving it a **Star** on GitHub!

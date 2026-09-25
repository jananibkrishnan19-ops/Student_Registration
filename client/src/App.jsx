import { useEffect, useMemo, useState } from 'react'
import './App.css'

const companyList = [
  'TCS',
  'Vibra',
  'HCL',
  'Infosys',
  'Wipro',
  'Cognizant',
  'Accenture',
  'IBM',
  'Capgemini',
  'Tech Mahindra',
]

const departments = [
  'Computer Science',
  'Information Technology',
  'Mechanical',
  'Civil',
  'Electrical',
  'Electronics',
  'Aerospace',
]

const years = ['I Year', 'II Year', 'III Year', 'IV Year']
const sections = ['A', 'B', 'C', 'D']

const initialForm = {
  studentName: '',
  gender: '',
  bloodGroup: '',
  rollNo: '',
  dob: '',
  email: '',
  address: '',
  phoneNumber: '',
  department: '',
  year: '',
  section: '',
  arrears: '0',
}

const API_URL = 'https://student-registration-w9xl.onrender.com/api/students'

function getStoredRegistrations() {
  const stored = localStorage.getItem('studentRegistrations')
  return stored ? JSON.parse(stored) : []
}

async function fetchRegistrations() {
  const response = await fetch(API_URL)
  if (!response.ok) {
    throw new Error('Unable to fetch registrations')
  }

  return response.json()
}

function App() {
  const [currentView, setCurrentView] = useState('student')
  const [form, setForm] = useState(initialForm)
  const [companySelections, setCompanySelections] = useState([])
  const [registrations, setRegistrations] = useState(getStoredRegistrations)
  const [message, setMessage] = useState('')

  useEffect(() => {
    localStorage.setItem('studentRegistrations', JSON.stringify(registrations))
  }, [registrations])

  useEffect(() => {
    fetchRegistrations()
      .then((students) => setRegistrations(students))
      .catch(() => {
        setMessage('Server is offline. Using local data only.')
      })
  }, [])

  const groupedCompanies = useMemo(() => {
    const groups = {}

    companyList.forEach((company) => {
      groups[company] = registrations.filter((student) =>
        student.companySelections?.includes(company),
      )
    })

    return groups
  }, [registrations])

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleStudentSubmit = (event) => {
    event.preventDefault()

    if (
      !form.studentName ||
      !form.gender ||
      !form.bloodGroup ||
      !form.rollNo ||
      !form.dob ||
      !form.email ||
      !form.address ||
      !form.phoneNumber ||
      !form.department ||
      !form.year ||
      !form.section ||
      form.arrears === ''
    ) {
      setMessage('Please fill all required fields before submitting.')
      return
    }

    if (Number(form.arrears) > 0) {
      const studentEntry = {
        ...form,
        companySelections: [],
        submittedAt: new Date().toISOString(),
      }

      fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentEntry),
      })
        .then(async (response) => {
          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.message || 'Submission failed')
          }

          setRegistrations((prev) => [data.student, ...prev])
          setForm(initialForm)
          setMessage('Student registration submitted successfully.')
          setCurrentView('student')
        })
        .catch((error) => {
          setMessage(error.message || 'Failed to save student to database.')
        })

      return
    }

    setCurrentView('company')
    setMessage('Please select exactly four companies.')
  }

  const handleCompanyToggle = (company) => {
    setCompanySelections((prev) => {
      if (prev.includes(company)) {
        return prev.filter((item) => item !== company)
      }

      if (prev.length >= 4) {
        return prev
      }

      return [...prev, company]
    })
  }

  const handleCompanySubmit = (event) => {
    event.preventDefault()

    if (companySelections.length !== 4) {
      setMessage('Please choose exactly four companies.')
      return
    }

    const studentEntry = {
      ...form,
      companySelections,
      submittedAt: new Date().toISOString(),
    }

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentEntry),
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Submission failed')
        }

        setRegistrations((prev) => [data.student, ...prev])
        setForm(initialForm)
        setCompanySelections([])
        setCurrentView('student')
        setMessage('Registration successful and company preferences saved.')
      })
      .catch((error) => {
        setMessage(error.message || 'Failed to save registration to database.')
      })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Campus Placement Portal</p>
          <h1>Student Registration</h1>
        </div>
        <nav className="nav-tabs" aria-label="Main navigation">
          <button
            type="button"
            className={currentView === 'student' ? 'tab active' : 'tab'}
            onClick={() => setCurrentView('student')}
          >
            Student Form
          </button>
          <button
            type="button"
            className={currentView === 'admin' ? 'tab active' : 'tab'}
            onClick={() => setCurrentView('admin')}
          >
            Admin View
          </button>
        </nav>
      </header>

      {message && <div className="status-banner">{message}</div>}

      {currentView === 'student' && (
        <section className="panel">
          <div className="panel-header">
            <h2>Student Details</h2>
            <span>Step 1 of 2</span>
          </div>

          <form onSubmit={handleStudentSubmit} className="student-form">
            <div className="form-grid">
              <label>
                Student Name
                <input
                  type="text"
                  name="studentName"
                  value={form.studentName}
                  onChange={handleFieldChange}
                  placeholder="Enter student name"
                />
              </label>

              <label>
                Gender
                <select name="gender" value={form.gender} onChange={handleFieldChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Blood Group
                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleFieldChange}
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </label>

              <label>
                Roll No
                <input
                  type="text"
                  name="rollNo"
                  value={form.rollNo}
                  onChange={handleFieldChange}
                  placeholder="Enter roll number"
                />
              </label>

              <label>
                Date of Birth
                <input type="date" name="dob" value={form.dob} onChange={handleFieldChange} />
              </label>

              <label>
                Email ID
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFieldChange}
                  placeholder="Enter email"
                />
              </label>

              <label className="wide-field">
                Address
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleFieldChange}
                  placeholder="Enter permanent address"
                  rows="3"
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleFieldChange}
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                Department of Engineering Course
                <select
                  name="department"
                  value={form.department}
                  onChange={handleFieldChange}
                >
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Year
                <select name="year" value={form.year} onChange={handleFieldChange}>
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Section
                <select name="section" value={form.section} onChange={handleFieldChange}>
                  <option value="">Select section</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Number of Arrears
                <input
                  type="number"
                  min="0"
                  name="arrears"
                  value={form.arrears}
                  onChange={handleFieldChange}
                />
              </label>
            </div>

            <div className="form-footer">
              <p>
                If arrears are zero, the system will take you to the company preference page.
              </p>
              <button type="submit" className="primary-button">
                {Number(form.arrears) === 0 ? 'Continue to Company Selection' : 'Register Student'}
              </button>
            </div>
          </form>
        </section>
      )}

      {currentView === 'company' && (
        <section className="panel">
          <div className="panel-header">
            <h2>Select Four MNC Companies</h2>
            <span>Step 2 of 2</span>
          </div>

          <form onSubmit={handleCompanySubmit} className="company-form">
            <div className="company-grid">
              {companyList.map((company) => {
                const isSelected = companySelections.includes(company)

                return (
                  <button
                    type="button"
                    key={company}
                    className={isSelected ? 'company-card selected' : 'company-card'}
                    onClick={() => handleCompanyToggle(company)}
                  >
                    <span>{company}</span>
                    <small>{isSelected ? 'Selected' : 'Select'}</small>
                  </button>
                )
              })}
            </div>

            <div className="selection-summary">
              <strong>Selected: {companySelections.length} / 4</strong>
            </div>

            <div className="form-footer company-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setCurrentView('student')}
              >
                Back
              </button>
              <button type="submit" className="primary-button">
                Save Registration
              </button>
            </div>
          </form>
        </section>
      )}

      {currentView === 'admin' && (
        <section className="panel">
          <div className="panel-header">
            <h2>Company-wise Registration View</h2>
            <span>{registrations.length} Total Registrations</span>
          </div>

          <div className="admin-grid">
            {companyList.map((company) => (
              <div className="company-report" key={company}>
                <div className="report-header">
                  <h3>{company}</h3>
                  <span>{groupedCompanies[company]?.length || 0}</span>
                </div>

                {groupedCompanies[company]?.length ? (
                  <ul>
                    {groupedCompanies[company].map((student) => (
                      <li key={`${student.rollNo}-${student.email}`}>
                        <strong>{student.studentName}</strong>
                        <span>
                          {student.department} • {student.year} • {student.section}
                        </span>
                        <small>{student.rollNo}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-state">No students selected this company.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default App

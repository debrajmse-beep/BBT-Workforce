import { useEffect, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./supabase";
import Human from "@vladmandic/human";

// ======================================================
// HUMAN FACE CONFIG
// ======================================================

const humanConfig = {
  backend: "webgl",

  modelBasePath:
    "https://vladmandic.github.io/human-models/models/",

  cacheModels: true,

  face: {
    enabled: true,

    detector: {
      rotation: true,
      maxDetected: 1,
      minConfidence: 0.65,
      minSize: 160,
    },

    mesh: {
      enabled: true,
    },

    attention: {
      enabled: false,
    },

    iris: {
      enabled: true,
    },

    description: {
      enabled: true,
    },

    emotion: {
      enabled: false,
    },

    antispoof: {
      enabled: true,
    },

    liveness: {
      enabled: true,
    },
  },

  body: {
    enabled: false,
  },

  hand: {
    enabled: false,
  },

  object: {
    enabled: false,
  },
};

// ======================================================
// HUMAN INSTANCE
// ======================================================

const human = new Human(humanConfig);

// ======================================================
// APP
// ======================================================

function App() {
  // ----------------------------------------------------
  // LOGIN
  // ----------------------------------------------------

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);

  // ----------------------------------------------------
  // PAGE
  // ----------------------------------------------------

  const [page, setPage] = useState("dashboard");

  // ----------------------------------------------------
  // EMPLOYEES
  // ----------------------------------------------------

  const [employees, setEmployees] = useState([]);

  const [loadingEmployees, setLoadingEmployees] =
    useState(false);

  const [showAddEmployee, setShowAddEmployee] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  // ----------------------------------------------------
  // EMPLOYEE FORM
  // ----------------------------------------------------

  const [employeeForm, setEmployeeForm] =
    useState({
      employee_id: "",
      full_name: "",
      mobile: "",
      designation: "",
      site: "",
      joining_date: "",
    });

  // ----------------------------------------------------
  // SESSION
  // ----------------------------------------------------

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data } =
      await supabase.auth.getSession();

    if (data.session) {
      setLoggedIn(true);
    }
  };

  // ====================================================
  // LOGIN
  // ====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setLoggedIn(true);
    setPage("dashboard");
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setLoggedIn(false);
    setPage("dashboard");

    setEmail("");
    setPassword("");
  };

  // ====================================================
  // LOAD EMPLOYEES
  // ====================================================

  const loadEmployees = async () => {
    setLoadingEmployees(true);

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    setLoadingEmployees(false);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    setEmployees(data || []);
  };

  // ====================================================
  // OPEN EMPLOYEES
  // ====================================================

  const openEmployees = () => {
    setPage("employees");

    setSelectedEmployee(null);

    setShowAddEmployee(false);

    loadEmployees();
  };

  // ====================================================
  // OPEN EMPLOYEE PROFILE
  // ====================================================

  const openEmployeeProfile = (employee) => {
    setSelectedEmployee(employee);

    setPage("employee-profile");
  };

  // ====================================================
  // EMPLOYEE FORM
  // ====================================================

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;

    setEmployeeForm((old) => ({
      ...old,
      [name]: value,
    }));
  };

  // ====================================================
  // ADD EMPLOYEE
  // ====================================================

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (
      !employeeForm.employee_id ||
      !employeeForm.full_name
    ) {
      alert(
        "Employee ID and Name are required."
      );

      return;
    }

    setLoadingEmployees(true);

    const { error } = await supabase
      .from("employees")
      .insert([
        {
          employee_id:
            employeeForm.employee_id,

          full_name:
            employeeForm.full_name,

          mobile:
            employeeForm.mobile,

          designation:
            employeeForm.designation,

          site:
            employeeForm.site,

          joining_date:
            employeeForm.joining_date || null,

          face_registered: false,

          status: "Active",
        },
      ]);

    setLoadingEmployees(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Employee added successfully!"
    );

    setEmployeeForm({
      employee_id: "",
      full_name: "",
      mobile: "",
      designation: "",
      site: "",
      joining_date: "",
    });

    setShowAddEmployee(false);

    loadEmployees();
  };

  // ====================================================
  // DASHBOARD
  // ====================================================

  const Dashboard = () => {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fb",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <Header />

        <main
          style={{
            padding: "30px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              marginBottom: "28px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                margin: "0 0 6px",
                fontSize: "28px",
                color: "#111827",
              }}
            >
              Dashboard
            </h1>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
              }}
            >
              Welcome to BBT Workforce
              Management System
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "18px",
              marginBottom: "30px",
            }}
          >
            <DashboardCard
              icon="👥"
              title="Employees"
              value={employees.length}
              onClick={openEmployees}
            />

            <DashboardCard
              icon="🕐"
              title="Present Today"
              value="0"
            />

            <DashboardCard
              icon="📸"
              title="Face Registered"
              value={
                employees.filter(
                  (e) =>
                    e.face_registered
                ).length
              }
            />

            <DashboardCard
              icon="📍"
              title="Sites"
              value="0"
            />
          </div>

          <h2
            style={{
              textAlign: "center",
              fontSize: "20px",
              marginBottom: "18px",
              color: "#111827",
            }}
          >
            Workforce Management
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "18px",
            }}
          >
            <ModuleCard
              icon="👥"
              title="Employees"
              description="Add and manage workers"
              onClick={openEmployees}
            />

            <ModuleCard
              icon="📸"
              title="Face Registration"
              description="Register employee faces"
            />

            <ModuleCard
              icon="🕐"
              title="Face Punch IN / OUT"
              description="Punch attendance using face"
              onClick={() => setPage("face-punch")}
            />

            <ModuleCard
              icon="📍"
              title="GPS & Sites"
              description="Manage work locations and geofence"
              onClick={() => setPage("sites") }
            />

            <ModuleCard
              icon="🏖️"
              title="Leave"
              description="Apply, approve and track leave"
              onClick={() => setPage("leave") }
            />

            <ModuleCard
              icon="📊"
              title="Attendance & Reports"
              description="Daily duty, OT and muster report"
              onClick={() => setPage("attendance")}
            />

            <ModuleCard
              icon="🏗️"
              title="BBT Projects"
              description="Project, site and daily BBT progress"
              onClick={() => setPage("bbt") }
            />

            <ModuleCard
              icon="⚙️"
              title="Settings"
              description="Shift, break, holiday and weekly off"
              onClick={() => setPage("settings") }
            />
          </div>
        </main>
      </div>
    );
  };

  // ====================================================
  // EMPLOYEES PAGE
  // ====================================================

  const EmployeesPage = () => {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fb",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <Header />

        <main
          style={{
            padding: "30px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "25px",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <button
                onClick={() =>
                  setPage("dashboard")
                }
                style={{
                  border: "none",
                  background:
                    "transparent",
                  color: "#1769e0",
                  cursor: "pointer",
                  padding: "0",
                  marginBottom:
                    "10px",
                  fontWeight: "600",
                }}
              >
                ← Back to Dashboard
              </button>

              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                  color: "#111827",
                }}
              >
                Employees
              </h1>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#6b7280",
                }}
              >
                Manage your workforce
                employees
              </p>
            </div>

            <button
              onClick={() =>
                setShowAddEmployee(
                  true
                )
              }
              style={{
                background:
                  "#1769e0",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding:
                  "12px 20px",
                fontWeight:
                  "600",
                cursor: "pointer",
              }}
            >
              + Add Employee
            </button>
          </div>

          {showAddEmployee && (
            <div
              style={{
                background:
                  "#ffffff",
                border:
                  "1px solid #e5e7eb",
                borderRadius:
                  "12px",
                padding: "25px",
                marginBottom:
                  "25px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom:
                    "20px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "20px",
                  }}
                >
                  Add New Employee
                </h2>

                <button
                  onClick={() =>
                    setShowAddEmployee(
                      false
                    )
                  }
                  style={{
                    border:
                      "none",
                    background:
                      "#f3f4f6",
                    borderRadius:
                      "6px",
                    padding:
                      "7px 12px",
                    cursor:
                      "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={
                  handleAddEmployee
                }
              >
                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(230px, 1fr))",
                    gap: "18px",
                  }}
                >
                  <FormInput
                    label="Employee ID *"
                    name="employee_id"
                    value={
                      employeeForm.employee_id
                    }
                    onChange={
                      handleEmployeeChange
                    }
                    placeholder="Example: EMP001"
                    required
                  />

                  <FormInput
                    label="Full Name *"
                    name="full_name"
                    value={
                      employeeForm.full_name
                    }
                    onChange={
                      handleEmployeeChange
                    }
                    placeholder="Employee full name"
                    required
                  />

                  <FormInput
                    label="Mobile Number"
                    name="mobile"
                    value={
                      employeeForm.mobile
                    }
                    onChange={
                      handleEmployeeChange
                    }
                    placeholder="10 digit mobile"
                  />

                  <FormInput
                    label="Designation"
                    name="designation"
                    value={
                      employeeForm.designation
                    }
                    onChange={
                      handleEmployeeChange
                    }
                    placeholder="Example: Technician"
                  />

                  <FormInput
                    label="Site"
                    name="site"
                    value={
                      employeeForm.site
                    }
                    onChange={
                      handleEmployeeChange
                    }
                    placeholder="Example: Mumbai Data Center"
                  />

                  <FormInput
                    label="Joining Date"
                    name="joining_date"
                    type="date"
                    value={
                      employeeForm.joining_date
                    }
                    onChange={
                      handleEmployeeChange
                    }
                  />
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    gap: "10px",
                    marginTop:
                      "22px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setShowAddEmployee(
                        false
                      )
                    }
                    style={{
                      padding:
                        "11px 18px",
                      border:
                        "1px solid #d1d5db",
                      background:
                        "white",
                      borderRadius:
                        "7px",
                      cursor:
                        "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      padding:
                        "11px 20px",
                      border:
                        "none",
                      background:
                        "#1769e0",
                      color:
                        "white",
                      borderRadius:
                        "7px",
                      cursor:
                        "pointer",
                      fontWeight:
                        "600",
                    }}
                  >
                    Save Employee
                  </button>
                </div>
              </form>
            </div>
          )}

          <div
            style={{
              background:
                "#ffffff",
              border:
                "1px solid #e5e7eb",
              borderRadius:
                "12px",
              overflow:
                "hidden",
            }}
          >
            <div
              style={{
                padding:
                  "20px",
                borderBottom:
                  "1px solid #e5e7eb",
                display:
                  "flex",
                justifyContent:
                  "space-between",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize:
                    "18px",
                }}
              >
                Employee List
              </h2>

              <span
                style={{
                  color:
                    "#6b7280",
                  fontSize:
                    "14px",
                }}
              >
                Total:{" "}
                {employees.length}
              </span>
            </div>

            {loadingEmployees ? (
              <div
                style={{
                  padding:
                    "40px",
                  textAlign:
                    "center",
                  color:
                    "#6b7280",
                }}
              >
                Loading employees...
              </div>
            ) : employees.length ===
              0 ? (
              <div
                style={{
                  padding:
                    "50px",
                  textAlign:
                    "center",
                  color:
                    "#6b7280",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "40px",
                    marginBottom:
                      "10px",
                  }}
                >
                  👥
                </div>

                <div
                  style={{
                    fontWeight:
                      "600",
                    marginBottom:
                      "6px",
                    color:
                      "#374151",
                  }}
                >
                  No employees yet
                </div>

                <div
                  style={{
                    fontSize:
                      "14px",
                  }}
                >
                  Click "Add Employee"
                  to create your first
                  employee.
                </div>
              </div>
            ) : (
              <div
                style={{
                  overflowX:
                    "auto",
                }}
              >
                <table
                  style={{
                    width:
                      "100%",
                    borderCollapse:
                      "collapse",
                    minWidth:
                      "850px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background:
                          "#f9fafb",
                        textAlign:
                          "left",
                      }}
                    >
                      <th
                        style={
                          thStyle
                        }
                      >
                        Employee ID
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Name
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Mobile
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Designation
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Site
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Joining Date
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map(
                      (
                        employee
                      ) => (
                        <tr
                          key={
                            employee.employee_id
                          }
                          onClick={() =>
                            openEmployeeProfile(
                              employee
                            )
                          }
                          style={{
                            cursor:
                              "pointer",
                          }}
                        >
                          <td
                            style={
                              tdStyle
                            }
                          >
                            {
                              employee.employee_id
                            }
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              fontWeight:
                                "600",
                              color:
                                "#1769e0",
                            }}
                          >
                            {
                              employee.full_name
                            }
                          </td>

                          <td
                            style={
                              tdStyle
                            }
                          >
                            {
                              employee.mobile ||
                              "-"
                            }
                          </td>

                          <td
                            style={
                              tdStyle
                            }
                          >
                            {
                              employee.designation ||
                              "-"
                            }
                          </td>

                          <td
                            style={
                              tdStyle
                            }
                          >
                            {
                              employee.site ||
                              "-"
                            }
                          </td>

                          <td
                            style={
                              tdStyle
                            }
                          >
                            {
                              employee.joining_date ||
                              "-"
                            }
                          </td>

                          <td
                            style={
                              tdStyle
                            }
                          >
                            <span
                              style={{
                                background:
                                  employee.status ===
                                  "Active"
                                    ? "#dcfce7"
                                    : "#fee2e2",

                                color:
                                  employee.status ===
                                  "Active"
                                    ? "#166534"
                                    : "#991b1b",

                                padding:
                                  "5px 10px",

                                borderRadius:
                                  "20px",

                                fontSize:
                                  "12px",

                                fontWeight:
                                  "600",
                              }}
                            >
                              {
                                employee.status
                              }
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  };

  // ====================================================
  // EMPLOYEE PROFILE
  // ====================================================

  const EmployeeProfilePage = () => {
    if (!selectedEmployee) {
      return null;
    }

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fb",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <Header />

        <main
          style={{
            padding: "30px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <button
            onClick={() => {
              setPage("employees");

              setSelectedEmployee(
                null
              );

              loadEmployees();
            }}
            style={{
              border: "none",
              background:
                "transparent",
              color: "#1769e0",
              cursor:
                "pointer",
              padding: "0",
              marginBottom:
                "20px",
              fontWeight:
                "600",
            }}
          >
            ← Back to Employees
          </button>

          {/* PROFILE HEADER */}

          <div
            style={{
              background:
                "#ffffff",
              border:
                "1px solid #e5e7eb",
              borderRadius:
                "14px",
              padding:
                "28px",
              marginBottom:
                "20px",
              display:
                "flex",
              alignItems:
                "center",
              gap: "20px",
              flexWrap:
                "wrap",
            }}
          >
            <div
              style={{
                width:
                  "80px",
                height:
                  "80px",
                borderRadius:
                  "50%",
                background:
                  "#1769e0",
                color:
                  "#ffffff",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize:
                  "32px",
                fontWeight:
                  "700",
              }}
            >
              {selectedEmployee.full_name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div
              style={{
                flex: 1,
              }}
            >
              <h1
                style={{
                  margin:
                    "0 0 6px",
                  fontSize:
                    "28px",
                  color:
                    "#111827",
                }}
              >
                {
                  selectedEmployee.full_name
                }
              </h1>

              <p
                style={{
                  margin:
                    "0 0 8px",
                  color:
                    "#6b7280",
                }}
              >
                {
                  selectedEmployee.designation ||
                  "Employee"
                }
              </p>

              <span
                style={{
                  display:
                    "inline-block",
                  background:
                    selectedEmployee.status ===
                    "Active"
                      ? "#dcfce7"
                      : "#fee2e2",
                  color:
                    selectedEmployee.status ===
                    "Active"
                      ? "#166534"
                      : "#991b1b",
                  padding:
                    "6px 12px",
                  borderRadius:
                    "20px",
                  fontSize:
                    "12px",
                  fontWeight:
                    "600",
                }}
              >
                {
                  selectedEmployee.status
                }
              </span>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}

          <div
            style={{
              background:
                "#ffffff",
              border:
                "1px solid #e5e7eb",
              borderRadius:
                "14px",
              padding:
                "25px",
              marginBottom:
                "20px",
            }}
          >
            <h2
              style={{
                margin:
                  "0 0 20px",
                fontSize:
                  "20px",
                color:
                  "#111827",
              }}
            >
              Personal Information
            </h2>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(230px, 1fr))",
                gap:
                  "20px",
              }}
            >
              <ProfileItem
                label="Employee ID"
                value={
                  selectedEmployee.employee_id ||
                  "-"
                }
              />

              <ProfileItem
                label="Full Name"
                value={
                  selectedEmployee.full_name ||
                  "-"
                }
              />

              <ProfileItem
                label="Mobile Number"
                value={
                  selectedEmployee.mobile ||
                  "-"
                }
              />

              <ProfileItem
                label="Designation"
                value={
                  selectedEmployee.designation ||
                  "-"
                }
              />

              <ProfileItem
                label="Site"
                value={
                  selectedEmployee.site ||
                  "-"
                }
              />

              <ProfileItem
                label="Joining Date"
                value={
                  selectedEmployee.joining_date ||
                  "-"
                }
              />
            </div>
          </div>

          {/* FACE REGISTRATION */}

          <FaceRegistrationSection
            employee={
              selectedEmployee
            }

            onSuccess={(
              updatedEmployee
            ) => {
              setSelectedEmployee(
                updatedEmployee
              );

              loadEmployees();
            }}
          />

          {/* ATTENDANCE */}

          <div
            style={{
              background:
                "#ffffff",
              border:
                "1px solid #e5e7eb",
              borderRadius:
                "14px",
              padding:
                "25px",
              marginTop:
                "20px",
            }}
          >
            <h2
              style={{
                margin:
                  "0 0 20px",
                fontSize:
                  "20px",
                color:
                  "#111827",
              }}
            >
              Attendance Summary
            </h2>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap:
                  "15px",
              }}
            >
              <SummaryCard
                icon="🕐"
                title="Present"
                value="0"
              />

              <SummaryCard
                icon="❌"
                title="Absent"
                value="0"
              />

              <SummaryCard
                icon="⏱️"
                title="Overtime"
                value="0 hrs"
              />

              <SummaryCard
                icon="🏖️"
                title="Leave"
                value="0"
              />
            </div>
          </div>
        </main>
      </div>
    );
  };

  // ====================================================
  // HEADER
  // ====================================================

  const Header = () => {
    return (
      <header
        style={{
          height:
            "70px",
          background:
            "#ffffff",
          borderBottom:
            "1px solid #e5e7eb",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          padding:
            "0 30px",
          boxSizing:
            "border-box",
        }}
      >
        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width:
                "42px",
              height:
                "42px",
              background:
                "#1769e0",
              color:
                "white",
              borderRadius:
                "10px",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              fontSize:
                "24px",
              fontWeight:
                "bold",
            }}
          >
            B
          </div>

          <div>
            <div
              style={{
                fontSize:
                  "20px",
                fontWeight:
                  "700",
                color:
                  "#111827",
              }}
            >
              BBT Workforce
            </div>

            <div
              style={{
                fontSize:
                  "12px",
                color:
                  "#6b7280",
              }}
            >
              Admin Portal
            </div>
          </div>
        </div>

        <button
          onClick={
            handleLogout
          }
          style={{
            border:
              "1px solid #d1d5db",
            background:
              "#ffffff",
            padding:
              "9px 16px",
            borderRadius:
              "7px",
            cursor:
              "pointer",
            fontWeight:
              "600",
          }}
        >
          Logout
        </button>
      </header>
    );
  };

  // ====================================================
  // LOGIN
  // ====================================================

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand">
            <div className="brand-logo">
              B
            </div>

            <div>
              <h1>
                BBT Workforce
              </h1>

              <p>
                Workforce Management System
              </p>
            </div>
          </div>

          <div className="login-title">
            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to your administrator
              account
            </p>
          </div>

          <form
            onSubmit={
              handleLogin
            }
          >
            <label>
              Username / Email
            </label>

            <input
              type="email"
              placeholder="Enter username or email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
            />

            <label>
              Password
            </label>

            <div className="password-box">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>

            {error && (
              <div
                style={{
                  color:
                    "#dc2626",
                  fontSize:
                    "13px",
                  marginTop:
                    "10px",
                  textAlign:
                    "center",
                }}
              >
                {error}
              </div>
            )}

            <div className="login-options">
              <label className="remember">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                className="forgot"
              >
                Forgot password?
              </button>
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={
                loading
              }
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>
          </form>

          <div className="login-footer">
            <span>
              BBT Workforce
            </span>

            <span>•</span>

            <span>
              Admin Portal
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // ROUTING
  // ====================================================

  if (
    page ===
    "employees"
  ) {
    return (
      <EmployeesPage />
    );
  }

  if (
    page ===
    "employee-profile"
  ) {
    return (
      <EmployeeProfilePage />
    );
  }

  if (
    page ===
    "face-punch"
  ) {
    return (
      <FacePunchPage />
    );
  }

  if (page === "attendance") {
    return <AttendancePage />;
  }

  if (page === "operations") {
    return <OperationsPage />;
  }

  if (page === "leave") {
    return <OperationsPage initialTab="leave" />;
  }

  if (page === "sites") {
    return <OperationsPage initialTab="sites" />;
  }

  if (page === "bbt") {
    return <OperationsPage initialTab="bbt" />;
  }

  if (page === "settings") {
    return <OperationsPage initialTab="settings" />;
  }

  return (
    <Dashboard />
  );
}


// ======================================================
// ALL-IN-ONE OPERATIONS CENTER
// ======================================================

const isoToday = () => new Date().toISOString().slice(0, 10);

const localDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "short",
    timeStyle: "short",
  });
};

const distanceMeters = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

function OperationsPage({ initialTab = "settings" }) {
  const [tab, setTab] = useState(initialTab);
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("employees").select("employee_id,full_name,site,status").order("full_name")
      .then(({ data }) => setEmployees(data || []));
  }, []);

  const tabs = [
    ["settings", "⚙️ Shift & Break"],
    ["sites", "📍 Sites & Geofence"],
    ["leave", "🏖️ Leave"],
    ["holidays", "📅 Holidays"],
    ["weekly", "🗓️ Weekly Off"],
    ["correction", "✏️ Corrections"],
    ["supervisor", "👷 Supervisor Access"],
    ["notifications", "🔔 Notifications"],
    ["bbt", "🏗️ BBT Work"],
    ["offline", "📡 Offline Sync"],
  ];

  const card = { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, marginBottom: 16 };
  const input = { width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8 };
  const button = { background: "#1769e0", color: "white", border: 0, borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: 600 };
  const danger = { ...button, background: "#dc2626" };

  const run = async (fn, success = "Saved successfully") => {
    setBusy(true); setMessage("");
    try { await fn(); setMessage(success); } catch (e) { console.error(e); setMessage(e?.message || "Operation failed"); }
    finally { setBusy(false); }
  };

  const ShiftTab = () => {
    const [name, setName] = useState("General Shift");
    const [start, setStart] = useState("09:00");
    const [end, setEnd] = useState("18:00");
    const [breakMin, setBreakMin] = useState(60);
    const [rows, setRows] = useState([]);
    const load = async () => { const { data, error } = await supabase.from("shift_templates").select("*").order("created_at", { ascending: false }); if(error) throw error; setRows(data||[]); };
    useEffect(() => { load().catch(e=>setMessage(e.message)); }, []);
    return <>
      <div style={card}><h2>Shift & Break</h2><p style={{color:"#6b7280"}}>Shift, lunch/break and duty rules.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
          <input style={input} value={name} onChange={e=>setName(e.target.value)} placeholder="Shift name" />
          <input style={input} type="time" value={start} onChange={e=>setStart(e.target.value)} />
          <input style={input} type="time" value={end} onChange={e=>setEnd(e.target.value)} />
          <input style={input} type="number" min="0" value={breakMin} onChange={e=>setBreakMin(Number(e.target.value))} placeholder="Break minutes" />
        </div>
        <button style={{...button,marginTop:12}} disabled={busy} onClick={()=>run(async()=>{const {error}=await supabase.from("shift_templates").insert([{name,start_time:start,end_time:end,break_minutes:breakMin,weekly_off_day:0}]);if(error)throw error;await load();})}>+ Add Shift</button>
      </div>
      <div style={card}><h3>Saved Shifts</h3>{rows.map(r=><div key={r.id} style={{padding:"10px 0",borderBottom:"1px solid #eee"}}><b>{r.name}</b> — {r.start_time} to {r.end_time} · Break {r.break_minutes} min</div>)}</div>
    </>;
  };

  const SitesTab = () => {
    const [name,setName]=useState(""); const [lat,setLat]=useState(""); const [lon,setLon]=useState(""); const [radius,setRadius]=useState(150); const [rows,setRows]=useState([]);
    const load=async()=>{const {data,error}=await supabase.from("sites").select("*").order("created_at",{ascending:false});if(error)throw error;setRows(data||[])};
    useEffect(()=>{load().catch(e=>setMessage(e.message))},[]);
    const useGPS=()=>navigator.geolocation?.getCurrentPosition(p=>{setLat(p.coords.latitude.toFixed(7));setLon(p.coords.longitude.toFixed(7))},e=>setMessage(e.message),{enableHighAccuracy:true});
    return <><div style={card}><h2>GPS Sites & Geofence</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12}}><input style={input} value={name} onChange={e=>setName(e.target.value)} placeholder="Site name"/><input style={input} value={lat} onChange={e=>setLat(e.target.value)} placeholder="Latitude"/><input style={input} value={lon} onChange={e=>setLon(e.target.value)} placeholder="Longitude"/><input style={input} type="number" value={radius} onChange={e=>setRadius(Number(e.target.value))} placeholder="Radius metres"/></div><div style={{marginTop:12,display:"flex",gap:8}}><button style={button} onClick={useGPS}>📍 Use Current GPS</button><button style={button} disabled={busy} onClick={()=>run(async()=>{const {error}=await supabase.from("sites").insert([{site_name:name,latitude:Number(lat),longitude:Number(lon),radius_m:radius,active:true}]);if(error)throw error;setName("");await load();})}>+ Add Site</button></div></div><div style={card}><h3>Sites</h3>{rows.map(r=><div key={r.id} style={{padding:"10px 0",borderBottom:"1px solid #eee"}}><b>{r.site_name}</b> — {r.latitude}, {r.longitude} · {r.radius_m}m</div>)}</div></>;
  };

  const LeaveTab = () => {
    const [emp,setEmp]=useState(""); const [type,setType]=useState("Casual"); const [from,setFrom]=useState(isoToday()); const [to,setTo]=useState(isoToday()); const [reason,setReason]=useState(""); const [rows,setRows]=useState([]);
    const load=async()=>{const {data,error}=await supabase.from("leaves").select("*,employees(full_name)").order("created_at",{ascending:false});if(error)throw error;setRows(data||[])}; useEffect(()=>{load().catch(e=>setMessage(e.message))},[]);
    return <><div style={card}><h2>Leave Apply / Approve</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}><select style={input} value={emp} onChange={e=>setEmp(e.target.value)}><option value="">Select employee</option>{employees.map(e=><option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}</select><select style={input} value={type} onChange={e=>setType(e.target.value)}><option>Casual</option><option>Sick</option><option>Earned</option><option>Emergency</option></select><input style={input} type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input style={input} type="date" value={to} onChange={e=>setTo(e.target.value)}/><input style={input} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason"/></div><button style={{...button,marginTop:12}} disabled={!emp||busy} onClick={()=>run(async()=>{const {error}=await supabase.from("leaves").insert([{employee_id:emp,leave_type:type,start_date:from,end_date:to,reason,status:"Pending"}]);if(error)throw error;setReason("");await load();})}>Apply Leave</button></div><div style={card}><h3>Requests</h3>{rows.map(r=><div key={r.id} style={{padding:12,borderBottom:"1px solid #eee"}}><b>{r.employees?.full_name||r.employee_id}</b> · {r.leave_type} · {r.start_date} → {r.end_date} · <b>{r.status}</b><div style={{marginTop:8,display:"flex",gap:8}}>{r.status==="Pending"&&<><button style={button} onClick={()=>run(async()=>{const {error}=await supabase.from("leaves").update({status:"Approved",approved_at:new Date().toISOString()}).eq("id",r.id);if(error)throw error;await load();},"Leave approved")}>Approve</button><button style={danger} onClick={()=>run(async()=>{const {error}=await supabase.from("leaves").update({status:"Rejected"}).eq("id",r.id);if(error)throw error;await load();},"Leave rejected")}>Reject</button></>}</div></div>)}</div></>;
  };

  const HolidaysTab = ({weekly=false}) => {
    const [name,setName]=useState(""); const [date,setDate]=useState(isoToday()); const [day,setDay]=useState(0); const [rows,setRows]=useState([]);
    const table=weekly?"weekly_offs":"holidays";
    const load=async()=>{const {data,error}=await supabase.from(table).select("*").order("created_at",{ascending:false});if(error)throw error;setRows(data||[])}; useEffect(()=>{load().catch(e=>setMessage(e.message))},[]);
    return <><div style={card}><h2>{weekly?"Weekly Off":"Holiday Calendar"}</h2>{weekly?<><select style={input} value={day} onChange={e=>setDay(Number(e.target.value))}><option value="0">Sunday</option><option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option></select><input style={{...input,marginTop:10}} value={name} onChange={e=>setName(e.target.value)} placeholder="Rule/site note"/><button style={{...button,marginTop:10}} onClick={()=>run(async()=>{const {error}=await supabase.from(table).insert([{day_of_week:day,note:name}]);if(error)throw error;await load();})}>+ Add Weekly Off</button></>:<><input style={input} type="date" value={date} onChange={e=>setDate(e.target.value)}/><input style={{...input,marginTop:10}} value={name} onChange={e=>setName(e.target.value)} placeholder="Holiday name"/><button style={{...button,marginTop:10}} onClick={()=>run(async()=>{const {error}=await supabase.from(table).insert([{holiday_date:date,name}]);if(error)throw error;await load();})}>+ Add Holiday</button></>}</div><div style={card}><h3>Saved</h3>{rows.map(r=><div key={r.id} style={{padding:10,borderBottom:"1px solid #eee"}}>{weekly?`${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][r.day_of_week]} — ${r.note||"Weekly off"}`:`${r.holiday_date} — ${r.name}`}</div>)}</div></>;
  };

  const CorrectionTab = () => {
    const [emp,setEmp]=useState(""); const [date,setDate]=useState(isoToday()); const [inTime,setInTime]=useState(""); const [outTime,setOutTime]=useState(""); const [reason,setReason]=useState(""); const [rows,setRows]=useState([]);
    const load=async()=>{const {data,error}=await supabase.from("attendance_corrections").select("*,employees(full_name)").order("created_at",{ascending:false});if(error)throw error;setRows(data||[])};useEffect(()=>{load().catch(e=>setMessage(e.message))},[]);
    return <><div style={card}><h2>Attendance Correction</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}><select style={input} value={emp} onChange={e=>setEmp(e.target.value)}><option value="">Employee</option>{employees.map(e=><option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}</select><input style={input} type="date" value={date} onChange={e=>setDate(e.target.value)}/><input style={input} type="time" value={inTime} onChange={e=>setInTime(e.target.value)}/><input style={input} type="time" value={outTime} onChange={e=>setOutTime(e.target.value)}/><input style={input} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason"/></div><button style={{...button,marginTop:12}} disabled={!emp||busy} onClick={()=>run(async()=>{const {error}=await supabase.from("attendance_corrections").insert([{employee_id:emp,attendance_date:date,requested_in:inTime||null,requested_out:outTime||null,reason,status:"Pending"}]);if(error)throw error;await load();})}>Submit Correction</button></div><div style={card}><h3>Pending / History</h3>{rows.map(r=><div key={r.id} style={{padding:12,borderBottom:"1px solid #eee"}}><b>{r.employees?.full_name||r.employee_id}</b> · {r.attendance_date} · IN {r.requested_in||"-"} · OUT {r.requested_out||"-"} · {r.status}{r.status==="Pending"&&<div style={{marginTop:8}}><button style={button} onClick={()=>run(async()=>{const {error}=await supabase.from("attendance_corrections").update({status:"Approved",approved_at:new Date().toISOString()}).eq("id",r.id);if(error)throw error;await load();},"Correction approved")}>Approve</button></div>}</div>)}</div></>;
  };

  const SupervisorTab = () => {
    const [name,setName]=useState(""); const [emp,setEmp]=useState(""); const [rows,setRows]=useState([]); const [access,setAccess]=useState([]);
    const load=async()=>{const {data,error}=await supabase.from("supervisors").select("*").order("created_at",{ascending:false});if(error)throw error;setRows(data||[]);}; useEffect(()=>{load().catch(e=>setMessage(e.message))},[]);
    const addSupervisor=()=>run(async()=>{const {data:user}=await supabase.auth.getUser();const {error}=await supabase.from("supervisors").insert([{user_id:user.user.id,name,email:user.user.email,active:true}]);if(error)throw error;await load();},"Supervisor created");
    const assign=()=>run(async()=>{const {data:user}=await supabase.auth.getUser();const {data:sv,error:se}=await supabase.from("supervisors").select("id").eq("user_id",user.user.id).single();if(se)throw se;const {error}=await supabase.from("supervisor_employee_access").insert([{supervisor_id:sv.id,employee_id:emp}]);if(error)throw error;setEmp("");},"Employee access added");
    return <><div style={card}><h2>Supervisor Access</h2><p style={{color:"#6b7280"}}>Current logged-in admin can be registered as a supervisor and assigned employees.</p><input style={input} value={name} onChange={e=>setName(e.target.value)} placeholder="Supervisor display name"/><button style={{...button,marginTop:10}} onClick={addSupervisor}>+ Register Current User</button><div style={{marginTop:16,display:"flex",gap:8}}><select style={input} value={emp} onChange={e=>setEmp(e.target.value)}><option value="">Select employee</option>{employees.map(e=><option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}</select><button style={button} disabled={!emp} onClick={assign}>Assign Employee</button></div></div><div style={card}><h3>Supervisors</h3>{rows.map(r=><div key={r.id} style={{padding:10,borderBottom:"1px solid #eee"}}><b>{r.name}</b> · {r.email}</div>)}</div></>;
  };

  const NotificationsTab = () => {
    const [emp,setEmp]=useState(""); const [title,setTitle]=useState(""); const [body,setBody]=useState(""); const [rows,setRows]=useState([]);
    const load=async()=>{const {data,error}=await supabase.from("notifications").select("*,employees(full_name)").order("created_at",{ascending:false}).limit(50);if(error)throw error;setRows(data||[])};useEffect(()=>{load().catch(e=>setMessage(e.message))},[]);
    return <><div style={card}><h2>Notifications</h2><select style={input} value={emp} onChange={e=>setEmp(e.target.value)}><option value="">All / Broadcast</option>{employees.map(e=><option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}</select><input style={{...input,marginTop:10}} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title"/><textarea style={{...input,marginTop:10,minHeight:80}} value={body} onChange={e=>setBody(e.target.value)} placeholder="Message"/><button style={{...button,marginTop:10}} onClick={()=>run(async()=>{const {data:user}=await supabase.auth.getUser();const {error}=await supabase.from("notifications").insert([{employee_id:emp||null,title,body,created_by:user.user.id}]);if(error)throw error;setTitle("");setBody("");await load();})}>Send Notification</button></div><div style={card}><h3>Recent</h3>{rows.map(r=><div key={r.id} style={{padding:10,borderBottom:"1px solid #eee"}}><b>{r.title}</b> — {r.body} · {r.employees?.full_name||"Broadcast"}</div>)}</div></>;
  };

  const BBTTab = () => {
    const [project,setProject]=useState(""); const [site,setSite]=useState(""); const [workDate,setWorkDate]=useState(isoToday()); const [installed,setInstalled]=useState(0); const [pending,setPending]=useState(0); const [notes,setNotes]=useState(""); const [projects,setProjects]=useState([]); const [progress,setProgress]=useState([]);
    const load=async()=>{const p=await supabase.from("bbt_projects").select("*").order("created_at",{ascending:false});if(p.error)throw p.error;setProjects(p.data||[]);const q=await supabase.from("bbt_daily_progress").select("*,bbt_projects(name)").order("work_date",{ascending:false}).limit(50);if(q.error)throw q.error;setProgress(q.data||[])};useEffect(()=>{load().catch(e=>setMessage(e.message))},[]);
    return <><div style={card}><h2>BBT Projects & Daily Progress</h2><input style={input} value={project} onChange={e=>setProject(e.target.value)} placeholder="Project name"/><button style={{...button,marginTop:10}} onClick={()=>run(async()=>{const {error}=await supabase.from("bbt_projects").insert([{name:project,status:"Active"}]);if(error)throw error;setProject("");await load();})}>+ Add Project</button><hr style={{margin:"18px 0",border:0,borderTop:"1px solid #eee"}}/><select style={input} value={site} onChange={e=>setSite(e.target.value)}><option value="">Project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginTop:10}}><input style={input} type="date" value={workDate} onChange={e=>setWorkDate(e.target.value)}/><input style={input} type="number" min="0" value={installed} onChange={e=>setInstalled(Number(e.target.value))} placeholder="Installed m"/><input style={input} type="number" min="0" value={pending} onChange={e=>setPending(Number(e.target.value))} placeholder="Pending m"/><input style={input} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes"/></div><button style={{...button,marginTop:10}} disabled={!site} onClick={()=>run(async()=>{const {error}=await supabase.from("bbt_daily_progress").insert([{project_id:site,work_date:workDate,installed_m:installed,pending_m:pending,notes}]);if(error)throw error;await load();})}>Save Daily Progress</button></div><div style={card}><h3>Projects</h3>{projects.map(p=><div key={p.id} style={{padding:8}}><b>{p.name}</b> · {p.status}</div>)}<h3>Recent Progress</h3>{progress.map(r=><div key={r.id} style={{padding:10,borderTop:"1px solid #eee"}}>{r.work_date} · {r.bbt_projects?.name||"-"} · Installed {r.installed_m}m · Pending {r.pending_m}m · {r.notes||""}</div>)}</div></>;
  };

  const OfflineTab = () => {
    const [count,setCount]=useState(0); const refresh=()=>{try{setCount(JSON.parse(localStorage.getItem("bbt_offline_punch_queue")||"[]").length)}catch{setCount(0)}};useEffect(()=>{refresh();window.addEventListener("online",refresh);return()=>window.removeEventListener("online",refresh)},[]);
    const sync=async()=>{const q=JSON.parse(localStorage.getItem("bbt_offline_punch_queue")||"[]");let left=[];for(const item of q){const {error}=await supabase.from("attendance").insert([item]);if(error)left.push(item)}localStorage.setItem("bbt_offline_punch_queue",JSON.stringify(left));refresh();setMessage(`${q.length-left.length} offline punch(es) synced.`)};
    return <div style={card}><h2>Offline Punch Sync</h2><p>Queued punches: <b>{count}</b></p><button style={button} disabled={!count||busy} onClick={()=>run(sync,"Offline punches synced")}>Sync Now</button><p style={{color:"#6b7280",fontSize:13}}>Offline punch data is stored locally on this browser until the internet is available.</p></div>;
  };

  const renderTab = () => {
    if(tab === "settings") return <ShiftTab />;
    if(tab === "sites") return <SitesTab />;
    if(tab === "leave") return <LeaveTab />;
    if(tab === "holidays") return <HolidaysTab />;
    if(tab === "weekly") return <HolidaysTab weekly />;
    if(tab === "correction") return <CorrectionTab />;
    if(tab === "supervisor") return <SupervisorTab />;
    if(tab === "notifications") return <NotificationsTab />;
    if(tab === "bbt") return <BBTTab />;
    return <OfflineTab />;
  };

  return <div style={{minHeight:"100vh",background:"#f4f7fb",fontFamily:"Arial,sans-serif"}}>
    <header style={{height:70,background:"white",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px"}}><b>BBT Workforce · Operations Center</b><button style={{...button,background:"white",color:"#111827",border:"1px solid #d1d5db"}} onClick={()=>window.location.reload()}>← Dashboard</button></header>
    <main style={{maxWidth:1250,margin:"0 auto",padding:24}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>{tabs.map(([id,label])=><button key={id} onClick={()=>setTab(id)} style={{...button,background:tab===id?"#1769e0":"white",color:tab===id?"white":"#374151",border:"1px solid #d1d5db"}}>{label}</button>)}</div>
      {message && <div style={{...card,background:message.toLowerCase().includes("failed")||message.toLowerCase().includes("error")?"#fff7ed":"#f0fdf4",color:"#374151"}}>{message}</div>}
      {renderTab()}
    </main>
  </div>;
}

// ======================================================
// ATTENDANCE / DUTY / OT REPORT PAGE
// ======================================================

function AttendancePage() {
  const getLocalDateKey = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const dateToLocalStart = (dateKey) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };

  const [date, setDate] = useState(() => getLocalDateKey());
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const SHIFT_START = "09:00";
  const SHIFT_END = "18:00";
  const BREAK_MINUTES = 60;
  const PRESENT_MINUTES = 450;
  const HALF_DAY_MINUTES = 240;

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (cancelled) return;
      await load();
    };

    refresh();

    // Keep the report in sync with new Face Punch IN/OUT records.
    // This polls every 5 seconds, so no manual browser refresh is needed.
    const intervalId = setInterval(refresh, 5000);

    const handleFocus = () => refresh();
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [date]);

  const load = async () => {
    setLoading(true); setError("");
    // Supabase stores punch_time as UTC. Convert the selected LOCAL calendar day
    // to UTC boundaries so India/Mumbai punches stay on the correct date.
    const localStart = dateToLocalStart(date);
    const localEnd = new Date(localStart);
    localEnd.setDate(localEnd.getDate() + 1);
    const start = localStart.toISOString();
    const end = localEnd.toISOString();
    const [a, e] = await Promise.all([
      supabase.from("attendance").select("*").gte("punch_time", start).lt("punch_time", end).order("punch_time", { ascending: true }),
      supabase.from("employees").select("employee_id, full_name, designation, site, status").order("employee_id"),
    ]);
    setLoading(false);
    if (a.error) { setError(a.error.message); return; }
    if (e.error) { setError(e.error.message); return; }
    setRows(a.data || []); setEmployees(e.data || []);
  };

  const minutesBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000));
  const hm = (mins) => `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
  const time = (v) => v ? new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
  const localMinutesOfDay = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return d.getHours() * 60 + d.getMinutes();
  };

  const report = employees.map((employee) => {
    const punches = rows.filter(r => r.employee_id === employee.employee_id).sort((a,b) => new Date(a.punch_time)-new Date(b.punch_time));
    const ins = punches.filter(r => r.punch_type === "IN");
    const outs = punches.filter(r => r.punch_type === "OUT");
    const firstIn = ins[0]?.punch_time || null;
    const lastOut = outs[outs.length - 1]?.punch_time || null;
    const gross = firstIn && lastOut ? minutesBetween(firstIn, lastOut) : 0;

    // Do not subtract a lunch break from very short test punches.
    // For a normal full shift, the default 60-minute lunch is deducted.
    const breakDeduction = gross >= 360 ? BREAK_MINUTES : 0;
    const duty = Math.max(0, gross - breakDeduction);

    const [startHour, startMinute] = SHIFT_START.split(":").map(Number);
    const [endHour, endMinute] = SHIFT_END.split(":").map(Number);
    const shiftStartMinutes = startHour * 60 + startMinute;
    const shiftEndMinutes = endHour * 60 + endMinute;
    const firstInMinutes = localMinutesOfDay(firstIn);
    const lastOutMinutes = localMinutesOfDay(lastOut);

    // Compare local clock times, not UTC strings. This fixes the 16h+ late / 7h+ OT issue.
    const late = firstInMinutes !== null ? Math.max(0, firstInMinutes - shiftStartMinutes) : 0;
    const ot = lastOutMinutes !== null ? Math.max(0, lastOutMinutes - shiftEndMinutes) : 0;
    let status = "Absent";
    if (duty >= PRESENT_MINUTES) status = "Present";
    else if (duty >= HALF_DAY_MINUTES) status = "Half Day";
    else if (firstIn) status = "Warning";
    return { employee, firstIn, lastOut, duty, late, ot, status, punches };
  });

  const present = report.filter(r => r.status === "Present").length;
  const half = report.filter(r => r.status === "Half Day").length;
  const absent = report.filter(r => r.status === "Absent").length;
  const totalOT = report.reduce((n,r) => n + r.ot, 0);

  const exportCSV = () => {
    const header = ["Date","Employee ID","Name","Site","IN","OUT","Duty Hours","Late","OT","Status"];
    const lines = [header, ...report.map(r => [date,r.employee.employee_id,r.employee.full_name,r.employee.site||"",time(r.firstIn),time(r.lastOut),hm(r.duty),hm(r.late),hm(r.ot),r.status])]
      .map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `BBT-Attendance-${date}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return <div style={{minHeight:"100vh",background:"#f4f7fb",fontFamily:"Arial, sans-serif"}}>
    <header style={{height:70,background:"#fff",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 30px"}}>
      <b style={{fontSize:20}}>📊 Attendance & Reports</b>
      <button onClick={()=>window.location.reload()} style={{padding:"9px 15px",background:"#fff",border:"1px solid #d1d5db",borderRadius:7,cursor:"pointer"}}>← Dashboard</button>
    </header>
    <main style={{maxWidth:1400,margin:"0 auto",padding:30}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:15,flexWrap:"wrap",marginBottom:20}}>
        <div><h1 style={{margin:"0 0 5px"}}>Daily Muster Roll</h1><p style={{margin:0,color:"#6b7280"}}>IN • OUT • Duty • Late • OT</p></div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{padding:"10px 12px",border:"1px solid #d1d5db",borderRadius:7}} />
          <button onClick={exportCSV} style={{padding:"10px 15px",background:"#1769e0",color:"white",border:0,borderRadius:7,cursor:"pointer",fontWeight:700}}>Export Excel/CSV</button>
          <button onClick={()=>window.print()} style={{padding:"10px 15px",background:"#111827",color:"white",border:0,borderRadius:7,cursor:"pointer",fontWeight:700}}>Print / PDF</button>
        </div>
      </div>
      {error && <div style={{background:"#fee2e2",color:"#991b1b",padding:12,borderRadius:8,marginBottom:15}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:20}}>
        <SummaryCard icon="✅" title="Present" value={present}/><SummaryCard icon="🌓" title="Half Day" value={half}/><SummaryCard icon="❌" title="Absent" value={absent}/><SummaryCard icon="⏱️" title="Total OT" value={hm(totalOT)}/>
      </div>
      <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,overflow:"auto"}}>
        {loading ? <div style={{padding:40,textAlign:"center"}}>Loading attendance...</div> : <table style={{width:"100%",borderCollapse:"collapse",minWidth:1000}}>
          <thead><tr style={{background:"#f9fafb"}}>{["ID","Name","Site","IN","OUT","Duty","Late","OT","Status"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>{report.map(r=><tr key={r.employee.employee_id}><td style={tdStyle}>{r.employee.employee_id}</td><td style={{...tdStyle,fontWeight:700}}>{r.employee.full_name}</td><td style={tdStyle}>{r.employee.site||"-"}</td><td style={tdStyle}>{time(r.firstIn)}</td><td style={tdStyle}>{time(r.lastOut)}</td><td style={tdStyle}>{hm(r.duty)}</td><td style={tdStyle}>{hm(r.late)}</td><td style={tdStyle}>{hm(r.ot)}</td><td style={tdStyle}><b>{r.status}</b></td></tr>)}</tbody>
        </table>}
      </div>
      <div style={{marginTop:15,padding:12,background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,fontSize:12,color:"#9a3412"}}>Current calculation: shift 09:00–18:00, 60-minute break, 7h30m or more net duty = Present, 4h00m–7h29m = Half Day, below 4h = Warning, and time after 18:00 = OT. These are system defaults and can be changed later.</div>
    </main>
  </div>;
}

// ======================================================
// FACE REGISTRATION COMPONENT
// ======================================================

function FaceRegistrationSection({
  employee,
  onSuccess,
}) {
  const videoRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const detectionTimerRef =
    useRef(null);

  const mountedRef =
    useRef(true);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [loadingCamera, setLoadingCamera] =
    useState(false);

  const [detecting, setDetecting] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [status, setStatus] =
    useState("");

  const [faceFound, setFaceFound] =
    useState(false);

  const [faceConfidence, setFaceConfidence] =
    useState(0);

  const [samples, setSamples] =
    useState(0);

  const [embedding, setEmbedding] =
    useState(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current =
        false;

      stopCamera();
    };
  }, []);

  // ----------------------------------------------------
  // STOP CAMERA
  // ----------------------------------------------------

  const stopCamera = () => {
    if (
      detectionTimerRef.current
    ) {
      clearTimeout(
        detectionTimerRef.current
      );

      detectionTimerRef.current =
        null;
    }

    if (
      streamRef.current
    ) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current =
        null;
    }

    if (
      videoRef.current
    ) {
      videoRef.current.srcObject =
        null;
    }

    setCameraOpen(false);
    setDetecting(false);
  };

  // ----------------------------------------------------
  // START CAMERA
  // ----------------------------------------------------

  const startCamera = async () => {
    try {
      setLoadingCamera(true);
      setStatus("Starting camera...");

      setEmbedding(null);
      setSamples(0);
      setFaceFound(false);
      setFaceConfidence(0);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

      streamRef.current = stream;
      setCameraOpen(true);

      setStatus("Loading face AI models...");

      await human.load();
      await human.warmup();

      await new Promise((resolve) =>
        requestAnimationFrame(resolve)
      );

      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error("Video play error:", playError);
        }
      }

      if (mountedRef.current) {
        setLoadingCamera(false);
        setStatus(
          "Camera ready. Look directly at the camera."
        );
        startDetection();
      }
    } catch (error) {
      console.error("Camera start error:", error);
      setLoadingCamera(false);
      setStatus(
        error?.message ||
          "Camera could not be started."
      );
      stopCamera();
    }
  };

  // ----------------------------------------------------
  // DETECTION
  // ----------------------------------------------------

  const startDetection = () => {
    setDetecting(true);

    detectFaceLoop();
  };

  const detectFaceLoop = async () => {
    if (
      !mountedRef.current ||
      !videoRef.current ||
      !streamRef.current
    ) {
      return;
    }

    if (
      videoRef.current.readyState <
      2
    ) {
      scheduleNextDetection();

      return;
    }

    try {
      const result =
        await human.detect(
          videoRef.current
        );

      if (
        !mountedRef.current
      ) {
        return;
      }

      const faces =
        result?.face || [];

      // ----------------------------------------------
      // No face
      // ----------------------------------------------

      if (
        faces.length === 0
      ) {
        setFaceFound(false);

        setFaceConfidence(0);

        setStatus(
          "No face detected. Look at the camera."
        );

        scheduleNextDetection();

        return;
      }

      // ----------------------------------------------
      // More than one face
      // ----------------------------------------------

      if (
        faces.length > 1
      ) {
        setFaceFound(false);

        setFaceConfidence(0);

        setStatus(
          "Only one person should be in the camera."
        );

        scheduleNextDetection();

        return;
      }

      const face =
        faces[0];

      const confidence =
        Number(
          face?.score || 0
        );

      setFaceConfidence(
        confidence
      );

      // ----------------------------------------------
      // Face confidence
      // ----------------------------------------------

      if (
        confidence <
        0.65
      ) {
        setFaceFound(false);

        setStatus(
          "Face detected, but confidence is low. Move closer and face the camera."
        );

        scheduleNextDetection();

        return;
      }

      // ----------------------------------------------
      // Embedding
      // ----------------------------------------------

      if (
        !face.embedding ||
        face.embedding.length ===
          0
      ) {
        setFaceFound(false);

        setStatus(
          "Face detected. Preparing face data..."
        );

        scheduleNextDetection();

        return;
      }

      // ----------------------------------------------
      // Anti-spoof / liveness
      // ----------------------------------------------

      const real =
        face.real;

      const live =
        face.live;

      if (
        real !== undefined &&
        real < 0.5
      ) {
        setFaceFound(false);

        setStatus(
          "Anti-spoof check failed. Use your real face."
        );

        scheduleNextDetection();

        return;
      }

      if (
        live !== undefined &&
        live < 0.5
      ) {
        setFaceFound(false);

        setStatus(
          "Liveness check failed. Look naturally at the camera."
        );

        scheduleNextDetection();

        return;
      }

      // ----------------------------------------------
      // Face is valid
      // ----------------------------------------------

      setFaceFound(true);

      setStatus(
        "Face detected. Keep your face still..."
      );

      // ----------------------------------------------
      // Collect multiple samples
      // ----------------------------------------------

      setEmbedding(
        face.embedding
      );

      setSamples(
        (old) =>
          Math.min(
            old + 1,
            3
          )
      );

      if (
        samples >= 2
      ) {
        setStatus(
          "Face captured successfully. You can save it."
        );

        setDetecting(false);

        return;
      }
    } catch (error) {
      console.error(
        "Face detection error:",
        error
      );

      setStatus(
        "Face detection error. Please try again."
      );
    }

    scheduleNextDetection();
  };

  const scheduleNextDetection = () => {
    if (
      !mountedRef.current ||
      !streamRef.current
    ) {
      return;
    }

    detectionTimerRef.current =
      setTimeout(
        detectFaceLoop,
        500
      );
  };

  // ----------------------------------------------------
  // SAVE FACE
  // ----------------------------------------------------

  const saveFace = async () => {
    if (
      !employee?.employee_id
    ) {
      alert(
        "Employee ID not found."
      );

      return;
    }

    if (
      !embedding ||
      embedding.length ===
        0
    ) {
      alert(
        "No valid face detected yet."
      );

      return;
    }

    try {
      setSaving(true);

      setStatus(
        "Saving face registration..."
      );

      // ----------------------------------------------
      // Check existing record
      // ----------------------------------------------

      const {
        data: existing,
        error:
          existingError,
      } = await supabase
        .from(
          "employee_faces"
        )
        .select("id")
        .eq(
          "employee_id",
          employee.employee_id
        )
        .maybeSingle();

      if (
        existingError
      ) {
        throw existingError;
      }

      // ----------------------------------------------
      // Insert / update face
      // ----------------------------------------------

      let faceError =
        null;

      if (existing) {
        const result =
          await supabase
            .from(
              "employee_faces"
            )
            .update({
              face_embedding:
                embedding,
            })
            .eq(
              "employee_id",
              employee.employee_id
            );

        faceError =
          result.error;
      } else {
        const result =
          await supabase
            .from(
              "employee_faces"
            )
            .insert([
              {
                employee_id:
                  employee.employee_id,

                face_embedding:
                  embedding,
              },
            ]);

        faceError =
          result.error;
      }

      if (
        faceError
      ) {
        throw faceError;
      }

      // ----------------------------------------------
      // Update employee status
      // ----------------------------------------------

      const {
        data: updatedEmployee,
        error:
          employeeError,
      } = await supabase
        .from(
          "employees"
        )
        .update({
          face_registered:
            true,
        })
        .eq(
          "employee_id",
          employee.employee_id
        )
        .select()
        .single();

      if (
        employeeError
      ) {
        throw employeeError;
      }

      setStatus(
        "Face registered successfully!"
      );

      setSamples(3);

      stopCamera();

      if (
        onSuccess
      ) {
        onSuccess(
          updatedEmployee
        );
      }
    } catch (error) {
      console.error(
        error
      );

      setStatus(
        error?.message ||
          "Could not save face registration."
      );
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // CANCEL
  // ----------------------------------------------------

  const cancelCamera = () => {
    stopCamera();

    setEmbedding(null);

    setSamples(0);

    setFaceFound(false);

    setStatus("");
  };

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------

  return (
    <div
      style={{
        background:
          "#ffffff",
        border:
          "1px solid #e5e7eb",
        borderRadius:
          "14px",
        padding:
          "25px",
      }}
    >
      <div
        style={{
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap:
            "15px",
          flexWrap:
            "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin:
                "0 0 8px",
              fontSize:
                "20px",
              color:
                "#111827",
            }}
          >
            Face Registration
          </h2>

          <p
            style={{
              margin: 0,
              color:
                "#6b7280",
              fontSize:
                "13px",
            }}
          >
            Register one face for this
            employee's attendance verification.
          </p>
        </div>

        {!cameraOpen &&
          !employee.face_registered && (
            <button
              onClick={
                startCamera
              }
              disabled={
                loadingCamera
              }
              style={{
                background:
                  "#1769e0",
                color:
                  "white",
                border:
                  "none",
                borderRadius:
                  "8px",
                padding:
                  "12px 18px",
                cursor:
                  "pointer",
                fontWeight:
                  "600",
              }}
            >
              {loadingCamera
                ? "Starting..."
                : "📸 Register Face"}
            </button>
          )}
      </div>

      {/* REGISTERED */}

      {!cameraOpen &&
        employee.face_registered && (
          <div
            style={{
              marginTop:
                "22px",
              padding:
                "18px",
              background:
                "#f0fdf4",
              border:
                "1px solid #bbf7d0",
              borderRadius:
                "10px",
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap:
                "15px",
              flexWrap:
                "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight:
                    "700",
                  color:
                    "#166534",
                }}
              >
                ✓ Face Registered
              </div>

              <div
                style={{
                  marginTop:
                    "5px",
                  fontSize:
                    "13px",
                  color:
                    "#15803d",
                }}
              >
                This employee has a
                registered face.
              </div>
            </div>

            <button
              onClick={
                startCamera
              }
              style={{
                background:
                  "white",
                color:
                  "#1769e0",
                border:
                  "1px solid #1769e0",
                borderRadius:
                  "8px",
                padding:
                  "10px 15px",
                cursor:
                  "pointer",
                fontWeight:
                  "600",
              }}
            >
              🔄 Re-register
            </button>
          </div>
        )}

      {/* CAMERA */}

      {cameraOpen && (
        <div
          style={{
            marginTop:
              "22px",
          }}
        >
          <div
            style={{
              position:
                "relative",
              width:
                "100%",
              maxWidth:
                "720px",
              margin:
                "0 auto",
              background:
                "#111827",
              borderRadius:
                "14px",
              overflow:
                "hidden",
            }}
          >
            <video
              ref={
                videoRef
              }
              autoPlay
              muted
              playsInline
              style={{
                display:
                  "block",
                width:
                  "100%",
                height:
                  "auto",
                minHeight:
                  "350px",
                objectFit:
                  "cover",
                transform:
                  "scaleX(-1)",
              }}
            />

            {/* FACE GUIDE */}

            <div
              style={{
                position:
                  "absolute",
                left:
                  "50%",
                top:
                  "50%",
                transform:
                  "translate(-50%, -50%)",
                width:
                  "220px",
                height:
                  "280px",
                border:
                  faceFound
                    ? "4px solid #22c55e"
                    : "3px solid #ffffff",
                borderRadius:
                  "50%",
                pointerEvents:
                  "none",
                boxSizing:
                  "border-box",
              }}
            />

            <div
              style={{
                position:
                  "absolute",
                left:
                  "15px",
                right:
                  "15px",
                bottom:
                  "15px",
                background:
                  "rgba(0,0,0,0.7)",
                color:
                  "white",
                borderRadius:
                  "8px",
                padding:
                  "10px 12px",
                textAlign:
                  "center",
                fontSize:
                  "13px",
              }}
            >
              {status ||
                "Look directly at the camera"}
            </div>
          </div>

          {/* STATUS */}

          <div
            style={{
              maxWidth:
                "720px",
              margin:
                "15px auto 0",
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap:
                "10px",
            }}
          >
            <StatusBox
              title="Face"
              value={
                faceFound
                  ? "Detected"
                  : "Searching"
              }
              ok={
                faceFound
              }
            />

            <StatusBox
              title="Confidence"
              value={
                faceConfidence
                  ? `${Math.round(
                      faceConfidence *
                        100
                    )}%`
                  : "--"
              }
              ok={
                faceConfidence >=
                0.65
              }
            />

            <StatusBox
              title="Samples"
              value={`${Math.min(
                samples,
                3
              )}/3`}
              ok={
                samples >=
                3
              }
            />
          </div>

          {/* BUTTONS */}

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "center",
              gap:
                "10px",
              marginTop:
                "18px",
              flexWrap:
                "wrap",
            }}
          >
            <button
              onClick={
                cancelCamera
              }
              disabled={
                saving
              }
              style={{
                background:
                  "white",
                border:
                  "1px solid #d1d5db",
                color:
                  "#374151",
                borderRadius:
                  "8px",
                padding:
                  "11px 18px",
                cursor:
                  "pointer",
              }}
            >
              Cancel
            </button>

            <button
              onClick={
                saveFace
              }
              disabled={
                saving ||
                !embedding ||
                !faceFound
              }
              style={{
                background:
                  saving ||
                  !embedding ||
                  !faceFound
                    ? "#9ca3af"
                    : "#16a34a",
                color:
                  "white",
                border:
                  "none",
                borderRadius:
                  "8px",
                padding:
                  "11px 20px",
                cursor:
                  saving ||
                  !embedding ||
                  !faceFound
                    ? "not-allowed"
                    : "pointer",
                fontWeight:
                  "600",
              }}
            >
              {saving
                ? "Saving..."
                : "✓ Save Face"}
            </button>
          </div>
        </div>
      )}

      {status &&
        !cameraOpen && (
          <div
            style={{
              marginTop:
                "15px",
              padding:
                "12px",
              background:
                "#f8fafc",
              borderRadius:
                "8px",
              color:
                "#475569",
              fontSize:
                "13px",
            }}
          >
            {status}
          </div>
        )}
    </div>
  );
}

// ======================================================
// FACE PUNCH PAGE
// ======================================================

function FacePunchPage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [status, setStatus] = useState("Camera is off.");
  const [matchedEmployee, setMatchedEmployee] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastPunch, setLastPunch] = useState(null);
  const [facesLoaded, setFacesLoaded] = useState(false);
  const [registeredFaces, setRegisteredFaces] = useState([]);

  const MATCH_THRESHOLD = 0.68;

  useEffect(() => {
    mountedRef.current = true;
    loadFaces();

    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, []);

  const normalizeEmbedding = (value) => {
    if (Array.isArray(value)) return value.map(Number);

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
          ? parsed.map(Number)
          : null;
      } catch {
        return null;
      }
    }

    return null;
  };

  const cosineSimilarity = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b)) return 0;

    const length = Math.min(a.length, b.length);
    if (!length) return 0;

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < length; i++) {
      const av = Number(a[i]) || 0;
      const bv = Number(b[i]) || 0;
      dot += av * bv;
      magA += av * av;
      magB += bv * bv;
    }

    if (!magA || !magB) return 0;

    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  };

  const loadFaces = async () => {
    setFacesLoaded(false);
    setStatus("Loading registered faces...");

    const [faceResult, employeeResult] = await Promise.all([
      supabase
        .from("employee_faces")
        .select("employee_id, face_embedding"),
      supabase
        .from("employees")
        .select("employee_id, full_name, designation, site, status")
        .eq("status", "Active"),
    ]);

    if (faceResult.error) {
      console.error(faceResult.error);
      setStatus(faceResult.error.message);
      return;
    }

    if (employeeResult.error) {
      console.error(employeeResult.error);
      setStatus(employeeResult.error.message);
      return;
    }

    const employeeMap = new Map(
      (employeeResult.data || []).map((employee) => [
        employee.employee_id,
        employee,
      ])
    );

    const validFaces = (faceResult.data || [])
      .map((row) => {
        const employee = employeeMap.get(row.employee_id);
        const embedding = normalizeEmbedding(row.face_embedding);

        if (!employee || !embedding || !embedding.length) {
          return null;
        }

        return {
          ...employee,
          embedding,
        };
      })
      .filter(Boolean);

    setRegisteredFaces(validFaces);
    setFacesLoaded(true);

    if (validFaces.length) {
      setStatus(`${validFaces.length} registered face(s) ready.`);
    } else {
      setStatus("No registered employee face found.");
    }
  };

  const stopCamera = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  const startCamera = async () => {
    try {
      setStarting(true);
      setMatchedEmployee(null);
      setConfidence(0);
      setStatus("Starting camera...");

      if (!facesLoaded) {
        await loadFaces();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      setStatus("Loading face AI models...");
      await human.load();
      await human.warmup();

      await new Promise((resolve) => requestAnimationFrame(resolve));

      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        try {
          await videoRef.current.play();
        } catch (error) {
          console.error("Video play error:", error);
        }
      }

      if (!mountedRef.current) return;

      setStarting(false);
      setStatus("Camera ready. Look directly at the camera.");
      detectFace();
    } catch (error) {
      console.error("Face punch camera error:", error);
      setStarting(false);
      setStatus(error?.message || "Camera could not be started.");
      stopCamera();
    }
  };

  const detectFace = async () => {
    if (!mountedRef.current || !videoRef.current || !streamRef.current) {
      return;
    }

    try {
      if (videoRef.current.readyState < 2) {
        timerRef.current = setTimeout(detectFace, 500);
        return;
      }

      const result = await human.detect(videoRef.current);
      const face = result?.face?.[0];

      if (!face) {
        setMatchedEmployee(null);
        setConfidence(0);
        setStatus("No face detected. Look at the camera.");
        timerRef.current = setTimeout(detectFace, 500);
        return;
      }

      const live = face.live;
      const real = face.real;

      if (live !== undefined && live < 0.5) {
        setMatchedEmployee(null);
        setConfidence(0);
        setStatus("Liveness check failed. Please look at the camera.");
        timerRef.current = setTimeout(detectFace, 700);
        return;
      }

      if (real !== undefined && real < 0.5) {
        setMatchedEmployee(null);
        setConfidence(0);
        setStatus("Face authenticity check failed.");
        timerRef.current = setTimeout(detectFace, 700);
        return;
      }

      const currentEmbedding = face.embedding;

      if (!currentEmbedding || !currentEmbedding.length) {
        setMatchedEmployee(null);
        setConfidence(0);
        setStatus("Face detected, but embedding is unavailable.");
        timerRef.current = setTimeout(detectFace, 500);
        return;
      }

      let bestEmployee = null;
      let bestScore = 0;

      for (const employee of registeredFaces) {
        const score = cosineSimilarity(
          currentEmbedding,
          employee.embedding
        );

        if (score > bestScore) {
          bestScore = score;
          bestEmployee = employee;
        }
      }

      const percent = Math.max(0, Math.min(100, bestScore * 100));
      setConfidence(percent);

      if (bestEmployee && bestScore >= MATCH_THRESHOLD) {
        setMatchedEmployee(bestEmployee);
        setStatus("Face matched. Confirm IN or OUT.");
      } else {
        setMatchedEmployee(null);
        setStatus("Face not recognized. Please try again.");
      }
    } catch (error) {
      console.error("Face detection error:", error);
      setStatus("Face detection error. Retrying...");
    }

    if (mountedRef.current && streamRef.current) {
      timerRef.current = setTimeout(detectFace, 700);
    }
  };

  const punchAttendance = async (punchType) => {
    if (!matchedEmployee) {
      alert("No employee matched. Please face the camera first.");
      return;
    }

    const queueOffline = (payload) => {
      const key = "bbt_offline_punch_queue";
      const old = JSON.parse(localStorage.getItem(key) || "[]");
      old.push({ ...payload, offline_queued_at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(old));
    };

    try {
      setSaving(true);
      setStatus(`Checking GPS and saving ${punchType} punch...`);
      const punchPayload = {
        employee_id: matchedEmployee.employee_id,
        punch_type: punchType,
        punch_time: new Date().toISOString(),
        latitude: null, longitude: null,
        site: matchedEmployee.site || null,
        face_confidence: confidence / 100,
      };

      if (!navigator.onLine) {
        queueOffline(punchPayload);
        setLastPunch(punchPayload);
        setStatus(`${matchedEmployee.full_name} — ${punchType} saved offline. It will sync when internet returns.`);
        setMatchedEmployee(null); setConfidence(0); return;
      }

      try {
        const position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error("GPS is not supported by this browser."));
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy:true, timeout:10000, maximumAge:30000 });
        });
        punchPayload.latitude = position.coords.latitude;
        punchPayload.longitude = position.coords.longitude;
      } catch (e) {
        setStatus("GPS permission/location unavailable. Punch was not recorded.");
        return;
      }

      if (matchedEmployee.site) {
        const { data: siteRows, error: siteError } = await supabase
          .from("sites").select("site_name,latitude,longitude,radius_m,active")
          .eq("site_name", matchedEmployee.site).eq("active", true).limit(1);
        if (siteError) throw siteError;
        const site = siteRows?.[0];
        if (site) {
          const distance = distanceMeters(punchPayload.latitude, punchPayload.longitude, Number(site.latitude), Number(site.longitude));
          if (distance > Number(site.radius_m || 150)) {
            setStatus(`Outside geofence: ${Math.round(distance)}m from ${site.site_name}. Required within ${site.radius_m}m.`);
            return;
          }
        }
      }

      const { data: latestRows, error: latestError } = await supabase
        .from("attendance").select("punch_type,punch_time")
        .eq("employee_id", matchedEmployee.employee_id)
        .order("punch_time", { ascending:false }).limit(1);
      if (latestError) throw latestError;
      const latest = latestRows?.[0];
      if (latest && latest.punch_type === punchType) {
        const minutesAgo = Math.floor((Date.now() - new Date(latest.punch_time).getTime()) / 60000);
        if (minutesAgo < 2) { setStatus(`Duplicate ${punchType} blocked. Please wait a moment.`); return; }
      }

      const { data, error } = await supabase.from("attendance").insert([punchPayload]).select().single();
      if (error) throw error;
      setLastPunch(data);
      setStatus(`${matchedEmployee.full_name} — ${punchType} recorded successfully.`);
      setMatchedEmployee(null); setConfidence(0);
    } catch (error) {
      console.error("Attendance save error:", error);
      if (!navigator.onLine || /network|fetch|failed to fetch|offline/i.test(error?.message || "")) {
        queueOffline({ employee_id:matchedEmployee.employee_id, punch_type:punchType, punch_time:new Date().toISOString(), latitude:null, longitude:null, site:matchedEmployee.site||null, face_confidence:confidence/100 });
        setStatus(`${matchedEmployee.full_name} — saved offline because the server was unavailable.`);
        setMatchedEmployee(null); setConfidence(0);
      } else { setStatus(error?.message || "Attendance could not be saved."); }
    } finally { setSaving(false); }
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          height: "70px",
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 30px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          📸 Face Punch IN / OUT
        </div>

        <button
          onClick={() => {
            stopCamera();
            window.location.reload();
          }}
          style={{
            border: "1px solid #d1d5db",
            background: "white",
            borderRadius: "8px",
            padding: "9px 14px",
            cursor: "pointer",
          }}
        >
          ← Dashboard
        </button>
      </header>

      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "30px 20px",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "22px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "25px",
              color: "#111827",
            }}
          >
            Face Punch
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Registered employee face match করে তারপর IN বা OUT confirm করুন।
          </p>
        </div>

        <div
          style={{
            background: "#111827",
            borderRadius: "14px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {cameraOpen ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                display: "block",
                width: "100%",
                minHeight: "430px",
                objectFit: "cover",
                transform: "scaleX(-1)",
              }}
            />
          ) : (
            <div
              style={{
                minHeight: "430px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "14px",
                color: "white",
              }}
            >
              <div style={{ fontSize: "60px" }}>📷</div>
              <div>Camera is off</div>
            </div>
          )}

          {cameraOpen && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "230px",
                height: "290px",
                border: matchedEmployee
                  ? "4px solid #22c55e"
                  : "3px solid white",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
          )}

          {cameraOpen && (
            <div
              style={{
                position: "absolute",
                left: "15px",
                right: "15px",
                bottom: "15px",
                background: "rgba(0,0,0,0.72)",
                color: "white",
                borderRadius: "9px",
                padding: "12px",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {status}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "18px",
            flexWrap: "wrap",
          }}
        >
          {!cameraOpen ? (
            <button
              onClick={startCamera}
              disabled={starting}
              style={{
                background: "#1769e0",
                color: "white",
                border: "none",
                borderRadius: "9px",
                padding: "13px 24px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {starting ? "Starting..." : "📸 Start Face Punch"}
            </button>
          ) : (
            <button
              onClick={stopCamera}
              style={{
                background: "#374151",
                color: "white",
                border: "none",
                borderRadius: "9px",
                padding: "13px 24px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Stop Camera
            </button>
          )}
        </div>

        <div
          style={{
            background: matchedEmployee ? "#f0fdf4" : "white",
            border: matchedEmployee
              ? "1px solid #86efac"
              : "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "22px",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          {matchedEmployee ? (
            <>
              <div
                style={{
                  fontSize: "13px",
                  color: "#166534",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                ✓ FACE MATCHED
              </div>

              <h2
                style={{
                  margin: "0 0 6px",
                  color: "#111827",
                }}
              >
                {matchedEmployee.full_name}
              </h2>

              <div
                style={{
                  color: "#4b5563",
                  fontSize: "14px",
                  marginBottom: "5px",
                }}
              >
                ID: {matchedEmployee.employee_id}
              </div>

              <div
                style={{
                  color: "#166534",
                  fontWeight: "700",
                  marginBottom: "18px",
                }}
              >
                Match: {confidence.toFixed(1)}%
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => punchAttendance("IN")}
                  disabled={saving}
                  style={{
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "9px",
                    padding: "13px 30px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  ✓ CONFIRM IN
                </button>

                <button
                  onClick={() => punchAttendance("OUT")}
                  disabled={saving}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "9px",
                    padding: "13px 30px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  ⇥ CONFIRM OUT
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                {status}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Match threshold: {MATCH_THRESHOLD}
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop:"14px", display:"flex", justifyContent:"center" }}>
          <button onClick={async()=>{
            const key="bbt_offline_punch_queue";
            const queue=JSON.parse(localStorage.getItem(key)||"[]");
            if(!queue.length){setStatus("No offline punches waiting for sync.");return;}
            const left=[];
            for(const item of queue){const copy={...item};delete copy.offline_queued_at;const {error}=await supabase.from("attendance").insert([copy]);if(error)left.push(item);}
            localStorage.setItem(key,JSON.stringify(left));
            setStatus(`${queue.length-left.length} offline punch(es) synced.`);
          }} style={{border:"1px solid #d1d5db",background:"white",borderRadius:"8px",padding:"9px 14px",cursor:"pointer"}}>📡 Sync Offline Punches</button>
        </div>

        {lastPunch && (
          <div
            style={{
              marginTop: "18px",
              padding: "15px",
              borderRadius: "10px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              textAlign: "center",
              color: "#1e40af",
              fontSize: "14px",
            }}
          >
            Last saved: {lastPunch.punch_type} — {lastPunch.employee_id}
          </div>
        )}

        <div
          style={{
            marginTop: "20px",
            padding: "13px",
            borderRadius: "9px",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          Face matching is confidence-based, not a 100% identity guarantee.
          Production use should include proper consent, access control and
          biometric-data protection.
        </div>
      </main>
    </div>
  );
}

// ======================================================
// STATUS BOX
// ======================================================

function StatusBox({
  title,
  value,
  ok,
}) {
  return (
    <div
      style={{
        background:
          ok
            ? "#f0fdf4"
            : "#f8fafc",
        border:
          `1px solid ${
            ok
              ? "#bbf7d0"
              : "#e5e7eb"
          }`,
        borderRadius:
          "8px",
        padding:
          "12px",
        textAlign:
          "center",
      }}
    >
      <div
        style={{
          fontSize:
            "12px",
          color:
            "#6b7280",
          marginBottom:
            "4px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontWeight:
            "700",
          color:
            ok
              ? "#166534"
              : "#374151",
          fontSize:
            "14px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ======================================================
// DASHBOARD CARD
// ======================================================

function DashboardCard({
  icon,
  title,
  value,
  onClick,
}) {
  return (
    <div
      onClick={
        onClick
      }
      style={{
        background:
          "#ffffff",
        border:
          "1px solid #e5e7eb",
        borderRadius:
          "12px",
        padding:
          "22px",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.04)",
        cursor:
          onClick
            ? "pointer"
            : "default",
        textAlign:
          "center",
      }}
    >
      <div
        style={{
          fontSize:
            "28px",
          marginBottom:
            "12px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color:
            "#6b7280",
          fontSize:
            "14px",
          marginBottom:
            "5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize:
            "28px",
          fontWeight:
            "700",
          color:
            "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ======================================================
// MODULE CARD
// ======================================================

function ModuleCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <div
      onClick={
        onClick
      }
      style={{
        background:
          "#ffffff",
        border:
          "1px solid #e5e7eb",
        borderRadius:
          "12px",
        padding:
          "24px",
        cursor:
          onClick
            ? "pointer"
            : "default",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.04)",
        textAlign:
          "center",
      }}
    >
      <div
        style={{
          fontSize:
            "32px",
          marginBottom:
            "14px",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          margin:
            "0 0 7px",
          fontSize:
            "17px",
          color:
            "#111827",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          fontSize:
            "13px",
          color:
            "#6b7280",
        }}
      >
        {description}
      </p>
    </div>
  );
}

// ======================================================
// FORM INPUT
// ======================================================

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}) {
  return (
    <div>
      <label
        style={{
          display:
            "block",
          marginBottom:
            "7px",
          fontSize:
            "13px",
          fontWeight:
            "600",
          color:
            "#374151",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={
          onChange
        }
        placeholder={
          placeholder
        }
        required={
          required
        }
        style={{
          width:
            "100%",
          boxSizing:
            "border-box",
          padding:
            "11px 12px",
          border:
            "1px solid #d1d5db",
          borderRadius:
            "7px",
          outline:
            "none",
          fontSize:
            "14px",
        }}
      />
    </div>
  );
}

// ======================================================
// PROFILE ITEM
// ======================================================

function ProfileItem({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding:
          "15px",
        background:
          "#f9fafb",
        borderRadius:
          "9px",
        border:
          "1px solid #f0f0f0",
      }}
    >
      <div
        style={{
          fontSize:
            "12px",
          color:
            "#6b7280",
          marginBottom:
            "6px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize:
            "15px",
          color:
            "#111827",
          fontWeight:
            "600",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  icon,
  title,
  value,
}) {
  return (
    <div
      style={{
        background:
          "#f9fafb",
        border:
          "1px solid #e5e7eb",
        borderRadius:
          "10px",
        padding:
          "20px",
        textAlign:
          "center",
      }}
    >
      <div
        style={{
          fontSize:
            "28px",
          marginBottom:
            "8px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize:
            "13px",
          color:
            "#6b7280",
          marginBottom:
            "5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize:
            "22px",
          fontWeight:
            "700",
          color:
            "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ======================================================
// TABLE STYLES
// ======================================================

const thStyle = {
  padding:
    "13px 15px",

  borderBottom:
    "1px solid #e5e7eb",

  fontSize:
    "13px",

  color:
    "#6b7280",

  fontWeight:
    "600",
};

const tdStyle = {
  padding:
    "14px 15px",

  borderBottom:
    "1px solid #f0f0f0",

  fontSize:
    "14px",

  color:
    "#374151",
};

export default App;
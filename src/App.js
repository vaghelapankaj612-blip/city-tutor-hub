
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";





// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Service from "./pages/Service";
import Appointment from "./pages/Appointment";

import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTutors from "./pages/admin/AdminTutors";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminRoute from "./routes/AdminRoute.js";

import AdminTutorAdd from "./pages/admin/AdminTutorAdd";
import AdminTutorEdit from "./pages/admin/AdminTutorEdit";
import AdminTutorAppointments from "./pages/admin/AdminTutorAppointments";



function App() {
  useEffect(() => {
  const token = localStorage.getItem("token");
  const loginTime = Number(localStorage.getItem("loginTime") || 0);

  const SESSION_MS = 24 * 60 * 60 * 1000;

  if (token && Date.now() - loginTime > SESSION_MS) {
    localStorage.clear();
  }
}, []);
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/service" element={<Service />} />
        <Route path="/appointment" element={<Appointment />} />
       
        <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
       
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tutors"
          element={
            <AdminRoute>
              <AdminTutors />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <AdminRoute>
              <AdminAppointments />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/inquiries"
          element={
            <AdminRoute>
              <AdminInquiries />
            </AdminRoute>
          }
        />


     
<Route path="/admin/tutors/add" element={<AdminRoute><AdminTutorAdd/></AdminRoute>} />
<Route path="/admin/tutors/:id/edit" element={<AdminRoute><AdminTutorEdit/></AdminRoute>} />
<Route
  path="/admin/tutor-appointments"
  element={
    <AdminRoute>
      <AdminTutorAppointments />
    </AdminRoute>
  }
/>
{/*  */}

      </Routes>
      
    </BrowserRouter>
  );
}
console.log("AdminLogin", AdminLogin);
console.log("AdminDashboard", AdminDashboard);
console.log("AdminUsers", AdminUsers);
console.log("AdminTutors", AdminTutors);
console.log("AdminAppointments", AdminAppointments);
console.log("AdminInquiries", AdminInquiries);
console.log("AdminTutorAdd", AdminTutorAdd);
console.log("AdminTutorEdit", AdminTutorEdit);
console.log("AdminTutorAppointments", AdminTutorAppointments);
console.log("AdminRoute", AdminRoute);

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Student from "./student/Student";
import Login from "./auth/Login";
import Leave from "./component/Leave";
import Attendance from "./component/Attendance";
import Complaint from "./component/Complaint";
import AdminRouter from "./admin/AdminRouter";
import RoomInfo from "./component/RoomInfo";
import FeeStatus from "./component/FeeStatus";
import MaintenanceRequest from "./component/MaintenanceRequest";
import MessMenu from "./component/MessMenu";
import Profile from "./component/Profile";
import ComingSoon from "./component/ComingSoon";
import { SpeedInsights } from '@vercel/speed-insights/react';

function AppRouter() {
  return (
    <SpeedInsights />
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/student' element={<Student />} />
        <Route path='/admin/*' element={<AdminRouter />} />
        <Route path='/leave' element={<Leave />} />
        <Route path='/attendance' element={<Attendance />} />
        <Route path='/complaint' element={<Complaint />} />
        <Route path='/roominfo' element={<RoomInfo />} />
        <Route path='/feestatus' element={<FeeStatus />} />
        <Route path='/messmenu' element={<MessMenu />} />
        <Route path='/maintenancerequest' element={<MaintenanceRequest />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/coming-soon' element={<ComingSoon />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

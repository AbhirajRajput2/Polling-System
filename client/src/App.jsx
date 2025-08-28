  import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
  import WelcomePage from "./pages/WelcomePage";
  import TeacherDashboard from "./pages/TeacherDashboard";
  import StudentDashboard from "./pages/StudentDashboard";
  import CreateQuestionPage from "./pages/CreateQuestionPage";
  import TeacherPollHistory from "./pages/TeacherPollHistor";

  export default function App() {
    const navigate = useNavigate();

    const handleContinue = (role) => {
      if (role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    };

    return (
      <Routes>
        <Route path="/" element={<WelcomePage onContinue={handleContinue} />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/question" element={<CreateQuestionPage />}/>
        <Route path="/teacher/history" element={<TeacherPollHistory />} />
      </Routes>
    );
  }

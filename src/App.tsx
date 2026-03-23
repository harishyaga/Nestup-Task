import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import WorkItems from "./pages/WorkItems";
import Members from "./pages/Members";
import Dependencies from "./pages/Dependencies";
import Intelligence from "./pages/Intelligence";
import MyTasks from "./pages/MyTasks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return user.role === 'admin' ? <AdminDashboard /> : <MemberDashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route path="/work-items" element={<WorkItems />} />
                <Route path="/members" element={<Members />} />
                <Route path="/dependencies" element={<Dependencies />} />
                <Route path="/intelligence" element={<Intelligence />} />
                <Route path="/my-tasks" element={<MyTasks />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

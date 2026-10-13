
import React, { useState } from 'react';

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import UsersView from './components/users/UsersView';
import { AppProvider, useApp } from './context/AppContext';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { DashboardView } from './components/dashboard/DashboardView';
import { FinancesView } from './components/finances/FinancesView';
import { PlanningView } from './components/planning/PlanningView';
import { EventsListView } from './components/events/EventsListView';
import { ClientsView } from './components/clients/ClientsView';
import { ClientDetailView } from './components/clients/ClientDetailView';
import { TasksView } from './components/tasks/TasksView';
import { TeamView } from './components/team/TeamView';
import { InventoryView } from './components/logistics/InventoryView';
import { ServicesCatalogView } from './components/services/ServicesCatalogView';
import { QuotesView } from './components/quotes/QuotesView';
import { PaymentsView } from './components/finances/PaymentsView';
import { ReservationsView } from './components/reservations/ReservationsView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { PricingCatalogView1 } from './components/pricing1/PricingCatalogView';
import { PricingPackCreateView } from './components/pricing1/PricingPackCreateView';
import { PricingPackDetailView } from './components/pricing1/PricingPackDetailView';
import { PricingPackEditView } from './components/pricing1/PricingPackEditView';
import { StatisticsView } from './components/stats/StatisticsView';
import { SettingsView } from './components/settings/SettingsView';

import { EventDetailModal } from './components/modals/EventDetailModal';
import { EventEditModal } from './components/modals/EventEditModal';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { TaskEditModal } from './components/modals/TaskEditModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { ExpenseModal } from './components/modals/ExpenseModal';

import RolesPermissionsView from './components/users/RolesPermissionsView';
import LoginView from './features/auth/LoginView';

import ProtectedRoute from './components/auth/ProtectedRoute';
import Places from './components/place/Places';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  const {
    isEventEditModalOpen,
    closeEventEditModal,
    openCreateEventModal,
    eventToEdit,
    quoteForEventCreation,
  } = useApp();

  /* Mobile sidebar */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* Quick modals */
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_auth');

    navigate('/login', {
      replace: true,
    });
  };


  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 antialiased overflow-hidden">


      <Sidebar
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onToggleSidebar={() =>
            setIsMobileMenuOpen((prev) => !prev)
          }

          onOpenNewEvent={openCreateEventModal}

          onOpenNewReceipt={() =>
            setIsReceiptModalOpen(true)
          }

          onOpenNewExpense={() =>
            setIsExpenseModalOpen(true)
          }

          onLogout={handleLogout}

          onOpenProfile={() => {
            navigate('/settings');
          }}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="max-w-7xl mx-auto">

            <Routes>
              <Route
                path="/"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />
              <Route
                path="/dashboard"
                element={<DashboardView />}
              />
              <Route
                path="/finances"
                element={<FinancesView />}
              />
              <Route path="/users" element={<UsersView />} />
              <Route
                path="/roles-permissions"
                element={<RolesPermissionsView />}
              />
              <Route
                path="/payments"
                element={<PaymentsView />}
              />
              <Route
                path="/planning"
                element={<PlanningView />}
              />
              <Route
                path="/events"
                element={<EventsListView />}
              />
              <Route
                path="/events/new"
                element={<EventsListView />}
              />
              <Route
                path="/events/:eventId"
                element={<EventsListView />}
              />
              <Route
                path="/events/:eventId/edit"
                element={<EventsListView />}
              />
              <Route
                path="/reservations"
                element={<ReservationsView />}
              />
              <Route
                path="/appointments"
                element={<AppointmentsView />}
              />
              <Route
                path="/clients"
                element={<ClientsView />}
              />

              <Route
                path="/clients/:clientId"
                element={<ClientDetailView />}
              />

              <Route
                path="/tasks"
                element={<TasksView />}
              />
              <Route
                path="/tasks/:taskId"
                element={<TasksView />}
              />
              <Route
                path="/tasks/:taskId/edit"
                element={<TasksView />}
              />

              <Route
                path="/team"
                element={
                  <TeamView defaultSubTab="team" />
                }
              />
              <Route
                path="/servers"
                element={
                  <TeamView defaultSubTab="servers" />
                }
              />

              <Route
                path="/equipment"
                element={<InventoryView />}
              />
              <Route
                path="/logistics"
                element={<InventoryView />}
              />

              <Route
                path="/services"
                element={<ServicesCatalogView />}
              />

              <Route
                path="/pricing"
                element={<PricingCatalogView1 />}
              />

              <Route
                path="/pricing/new"
                element={<PricingPackCreateView />}
              />

              <Route
                path="/pricing/:packId"
                element={<PricingPackDetailView />}
              />

              <Route
                path="/pricing/:packId/edit"
                element={<PricingPackEditView />}
              />
              <Route
                path="/quotes"
                element={
                  <QuotesView defaultType="devis" />
                }
              />

              <Route
                path="/invoices"
                element={
                  <QuotesView defaultType="facture" />
                }
              />

              <Route
                path="/statistics"
                element={<StatisticsView />}
              />

              <Route
                path="/settings"
                element={<SettingsView />}
              />
              <Route
                path="/places"
                element={<Places />}
              />

              <Route
                path="*"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

            </Routes>

          </div>
        </main>
      </div>


      {/* =====================================================
          GLOBAL MODALS
      ===================================================== */}

      <EventDetailModal />

      <EventEditModal
        isOpen={isEventEditModalOpen}
        onClose={closeEventEditModal}
        eventToEdit={eventToEdit}
        quoteForEventCreation={quoteForEventCreation}
      />

      <TaskDetailModal />

      <TaskEditModal />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() =>
          setIsReceiptModalOpen(false)
        }
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() =>
          setIsExpenseModalOpen(false)
        }
      />

    </div>
  );
};


/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <AppProvider>

      <Routes>

        {/* =================================================
            PUBLIC ROUTE
        ================================================= */}

        <Route
          path="/login"
          element={<LoginView />}
        />


        {/* =================================================
            PROTECTED ADMIN ROUTES
        ================================================= */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={<MainLayout />}
          />
        </Route>


        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </AppProvider>
  );
}


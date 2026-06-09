'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scissors,
  Mail,
  Lock,
  User,
  Store,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Sparkles,
  Calendar,
  Clock,
  Plus,
  LogOut,
  DollarSign,
  ChevronRight,
  TrendingUp,
  Settings,
  Users,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Typings for simulated/active session
interface SessionUser {
  email: string;
  salonName?: string;
  fullName?: string;
  mode: 'real' | 'demo';
}

export default function LoginRegisterPage() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [salonName, setSalonName] = useState('');
  const [fullName, setFullName] = useState('');

  // Feedback States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  // Active Session state for preview simulation
  const [session, setSession] = useState<SessionUser | null>(null);

  // Simulated Appointments for Dashboard
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      client: 'Ana Silva',
      service: 'Corte & Balayage',
      rsvp: '10:30',
      status: 'Confirmado',
      price: 65,
    },
    {
      id: 2,
      client: 'Mariana Costa',
      service: 'Manicura Gel',
      rsvp: '11:45',
      status: 'Confirmado',
      price: 25,
    },
    {
      id: 3,
      client: 'Rita Santos',
      service: 'Alisamento Progressivo',
      rsvp: '14:00',
      status: 'Pendente',
      price: 90,
    },
    {
      id: 4,
      client: 'Carolina Lima',
      service: 'Sobrancelhas Designer',
      rsvp: '15:30',
      status: 'Confirmado',
      price: 15,
    },
  ]);

  const [newClientName, setNewClientName] = useState('');
  const [newService, setNewService] = useState('Corte Feminino');
  const [newTime, setNewTime] = useState('16:45');
  const [newPrice, setNewPrice] = useState('30');
  const [showAddModal, setShowAddModal] = useState(false);

  // Authenticate / Register Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!email || !password) {
      setErrorMessage('Por favor, preencha o e-mail e a palavra-passe.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A palavra-passe deve ter pelo menos 6 caracteres.');
      setIsSubmitting(false);
      return;
    }

    if (activeTab === 'register' && !salonName) {
      setErrorMessage('Por favor, informe o nome do seu salão.');
      setIsSubmitting(false);
      return;
    }

    // DEMO / SIMULATION MODE
    if (isDemoMode) {
      setTimeout(() => {
        setIsSubmitting(false);
        setSession({
          email,
          salonName:
            activeTab === 'register' ? salonName : 'Salão de Beleza Realce',
          fullName: activeTab === 'register' ? fullName : 'Profissional',
          mode: 'demo',
        });
        setSuccessMessage(
          activeTab === 'register'
            ? 'Conta de demonstração criada com sucesso! Bem-vindo.'
            : 'Login de demonstração efetuado com sucesso!'
        );
      }, 1200);
      return;
    }

    // REAL SUPABASE INTEGRATION MODE
    try {
      if (activeTab === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Fetch custom metadata or simulate active profile loading
        setSession({
          email: data.user?.email || email,
          salonName:
            data.user?.user_metadata?.salon_name || 'Meu Salão Supabase',
          fullName: data.user?.user_metadata?.full_name || 'Utilizador',
          mode: 'real',
        });
        setSuccessMessage('Sessão iniciada com sucesso (via Supabase)!');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              salon_name: salonName,
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        // Check if confirmation email is required
        if (data.session) {
          setSession({
            email: data.user?.email || email,
            salonName,
            fullName,
            mode: 'real',
          });
          setSuccessMessage('Conta registada e login concluído com sucesso!');
        } else {
          setSuccessMessage(
            'Registo efetuado! Por favor, confirme o seu e-mail para validar a conta.'
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Ocorreu um erro ao processar o seu pedido.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!isDemoMode && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setEmail('');
    setPassword('');
    setSalonName('');
    setFullName('');
    setSuccessMessage('Sessão encerrada com sucesso.');
  };

  const addSimulatedAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newService) return;

    const newAppt = {
      id: Date.now(),
      client: newClientName,
      service: newService,
      rsvp: newTime,
      status: 'Confirmado',
      price: parseFloat(newPrice) || 20,
    };

    setAppointments(
      [...appointments, newAppt].sort((a, b) => a.rsvp.localeCompare(b.rsvp))
    );
    setNewClientName('');
    setShowAddModal(false);
  };

  // Render Dashboard Workspace once Authenticated
  if (session) {
    const totalEarnings = appointments.reduce(
      (sum, appt) => sum + appt.price,
      0
    );

    return (
      <main
        className="min-h-screen bg-slate-50 text-slate-800"
        id="authenticated-dashboard"
      >
        {/* Navbar */}
        <header
          className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-rose-100 px-6 py-4 flex items-center justify-between z-10"
          id="dashboard-header"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                {session.salonName}
              </h1>
              <p className="text-xs text-rose-600/80 font-medium">
                BelaAgenda SaaS • Painel Geral
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                session.mode === 'real'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  session.mode === 'real'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500 animate-pulse'
                }`}
              ></span>
              Modo:{' '}
              {session.mode === 'real' ? 'Supabase Ativo' : 'Simulado / Demo'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-xs bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors px-3 py-1.5 rounded-lg font-medium"
              id="logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Content Container */}
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <SectionWelcome session={session} />

          {/* Quick Metrics Cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            id="dashboard-metrics"
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Ganhos de Hoje
                </span>
                <p className="text-3xl font-bold text-slate-900">
                  {totalEarnings} €
                </p>
                <div className="flex items-center space-x-1 text-emerald-600 text-xs font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12% vs. ontem</span>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-500">
                <DollarSign className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Agendamentos
                </span>
                <p className="text-3xl font-bold text-slate-900">
                  {appointments.length}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {appointments.filter((a) => a.status === 'Confirmado').length}{' '}
                  Confirmados
                </p>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl text-rose-500">
                <Calendar className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Taxa de Ocupação
                </span>
                <p className="text-3xl font-bold text-slate-900">82%</p>
                <p className="text-xs text-slate-500 font-medium">
                  Capacidade quase preenchida
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl text-blue-500">
                <Users className="w-6 h-6" />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointments List (Col-span 2) */}
            <div
              className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              id="appt-list-card"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Lista de Agendamentos de Hoje
                  </h3>
                  <p className="text-xs text-slate-400">
                    Gerencie os horários dos seus clientes em tempo real
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
                  id="add-appointment-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Agendamento</span>
                </button>
              </div>

              {appointments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  Não há agendamentos agendados para hoje.
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-rose-600 text-sm">
                          {appt.client
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {appt.client}
                          </p>
                          <p className="text-xs text-slate-400">
                            {appt.service}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{appt.rsvp}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-slate-900">
                            {appt.price} €
                          </p>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              appt.status === 'Confirmado'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {appt.status}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setAppointments(
                              appointments.filter((a) => a.id !== appt.id)
                            )
                          }
                          className="text-xs text-slate-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50/50 transition-colors"
                          title="Eliminar"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6"
              id="dashboard-sidebar-panel"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900">
                  Configurações Rápidas
                </h3>
                <p className="text-xs text-slate-400 text-[11px]">
                  Personalização imediata do seu software BelaAgenda
                </p>
              </div>

              {/* Quick Preferences */}
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <Sparkles className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Marcação Online
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Permitir que clientes agendem sozinhos
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <Mail className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Alertas por E-mail
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Enviar aviso de confirmação
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <Clock className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Intervalo de Segurança
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Apenas folga de 10 min entre serviços
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>
              </div>

              {/* Quick instructions to developer */}
              <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100/60 text-xs text-rose-800 space-y-1.5">
                <div className="flex items-center space-x-1 font-semibold text-rose-900">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configuração Técnica</span>
                </div>
                <p className="leading-relaxed">
                  Para ligar ao seu Supabase definitivo, adicione as variáveis
                  no painel <strong className="font-semibold">Secrets</strong>{' '}
                  da sua barra lateral:
                </p>
                <div className="bg-white/80 p-2 rounded border border-rose-100 font-mono text-[10px] select-all space-y-0.5 text-slate-700">
                  <div>NEXT_PUBLIC_SUPABASE_URL</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Novo Agendamento */}
        <AnimatePresence>
          {showAddModal && (
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              id="new-appt-modal"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-xl overflow-hidden"
              >
                <div className="bg-rose-50/60 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-950 text-sm">
                    Criar Novo Agendamento
                  </h4>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ×
                  </button>
                </div>
                <form
                  onSubmit={addSimulatedAppointment}
                  className="p-6 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Clara Albuquerque"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Serviço
                      </label>
                      <select
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
                      >
                        <option>Corte Feminino</option>
                        <option>Balayage Luxo</option>
                        <option>Unhas Gel</option>
                        <option>Sobrancelhas Designer</option>
                        <option>Hidratação Capilar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Horário
                      </label>
                      <input
                        type="time"
                        required
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Preço (€)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Ex: 35"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 rounded-xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold py-3 rounded-xl transition shadow-sm"
                    >
                      Confirmar Horário
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  // LOGIN & REGISTER GORGEOUS CLIENT-SIDE FORMS
  return (
    <main
      className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FFFBF9] to-[#FAF8F5] flex flex-col justify-between py-8 px-4"
      id="login-layout-wrapper"
    >
      {/* Upper Logo / Context */}
      <header
        className="w-full max-w-md mx-auto text-center"
        id="theme-logo-box"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-rose-100 shadow-sm"
        >
          <Scissors className="w-4 h-4 text-rose-500" />
          <span className="font-semibold text-slate-900 text-sm tracking-tight">
            BelaAgenda SaaS
          </span>
        </motion.div>
        <p className="text-xs text-rose-600/70 font-medium mt-1.5 uppercase tracking-widest">
          SaaS de Agendamento Inteligente para Salões de Beleza
        </p>
      </header>

      {/* Main Form Area */}
      <div className="w-full max-w-md mx-auto my-6" id="form-container">
        {/* Supabase Status Banner */}
        <StatusBanner isDemoMode={isDemoMode} setIsDemoMode={setIsDemoMode} />

        <div className="bg-white rounded-3xl border border-rose-100/50 shadow-xl overflow-hidden mt-4">
          {/* Header Tab Switchers */}
          <div
            className="flex border-b border-slate-100 bg-slate-50/50"
            id="tabs-switcher"
          >
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-4 text-xs font-bold transition-all relative ${
                activeTab === 'login'
                  ? 'text-rose-600 bg-white'
                  : 'text-slate-400 hover:text-slate-900'
              }`}
              id="tab-login-btn"
            >
              <span>Entrar</span>
              {activeTab === 'login' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500"
                />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-4 text-xs font-bold transition-all relative ${
                activeTab === 'register'
                  ? 'text-rose-600 bg-white'
                  : 'text-slate-400 hover:text-slate-900'
              }`}
              id="tab-register-btn"
            >
              <span>Criar Conta</span>
              {activeTab === 'register' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500"
                />
              )}
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {activeTab === 'login'
                  ? 'Bem-vindo de volta'
                  : 'Mude a gestão do seu salão'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {activeTab === 'login'
                  ? 'Inicie sessão para gerenciar a sua agenda e controlar a faturação hoje.'
                  : 'Registe-se em minutos e garanta agendamentos ilimitados no seu painel.'}
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-xs flex items-start space-x-2"
                  id="error-feedback"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 text-xs flex items-start space-x-2"
                  id="success-feedback"
                >
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Authentication Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              id="auth-form-submit"
            >
              {/* Optional Registration Fields */}
              <AnimatePresence mode="popLayout">
                {activeTab === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5" id="field-fullName">
                      <label className="text-xs font-semibold text-slate-600 block">
                        Seu Nome Completo
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-300">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Cláudia Santos"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all text-slate-800 placeholder-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5" id="field-salonName">
                      <label className="text-xs font-semibold text-slate-600 block">
                        Nome do Salão
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-300">
                          <Store className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Salão Beleza D'Ouro"
                          value={salonName}
                          onChange={(e) => setSalonName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all text-slate-800 placeholder-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Core Email / Password Fields */}
              <div className="space-y-1.5" id="field-email">
                <label className="text-xs font-semibold text-slate-600 block">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-300">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all text-slate-800 placeholder-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5" id="field-password">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600 block">
                    Palavra-passe
                  </label>
                  {activeTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(
                          'Para repor a palavra-passe definitiva, contacte o suporte ou utilize o portal oficial do Supabase.'
                        );
                      }}
                      className="text-[10px] text-rose-500 hover:underline font-semibold"
                    >
                      Esqueceu-se?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-300">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all text-slate-800 placeholder-slate-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs py-3.5 px-4 rounded-2xl shadow-md shadow-rose-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 cursor-pointer"
                id="submit-auth-btn"
              >
                <span>
                  {isSubmitting
                    ? 'A processar...'
                    : activeTab === 'login'
                    ? 'Iniciar Sessão'
                    : 'Concluir Registo'}
                </span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Design Details */}
      <footer
        className="w-full max-w-sm mx-auto text-center text-[10px] text-slate-400"
        id="login-footer"
      >
        <p className="font-semibold text-slate-500 mb-1">
          BelaAgenda © {new Date().getFullYear()}
        </p>
        <p>
          Segurança SSL de ponta a ponta integrada com a infraestrutura cloud do
          Supabase Database & Auth para proteção total de dados.
        </p>
      </footer>
    </main>
  );
}

// Sub Component: Status Banner for Sandbox vs Real Client Selection
function StatusBanner({
  isDemoMode,
  setIsDemoMode,
}: {
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}) {
  return (
    <div
      className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col space-y-3 shadow-md"
      id="status-selection-card"
    >
      <div className="flex items-start space-x-2">
        <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-900">
            Estado de Ligação do SDK Supabase
          </p>
          <p className="text-[11px] leading-relaxed text-slate-400">
            {isSupabaseConfigured
              ? 'Encontramos as credenciais correspondentes às variáveis do seu sistema.'
              : 'Nenhuma credencial supabásica ativa foi encontrada no seu ambiente. Pode introduzir no menu lateral do editor.'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-50 rounded-xl" id="mode-tabs">
        <button
          onClick={() => {
            if (!isSupabaseConfigured) {
              alert(
                'Por favor configure as chaves públicas do Supabase para ativar a Ligação Real.'
              );
              return;
            }
            setIsDemoMode(false);
          }}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            !isDemoMode
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-404 hover:text-slate-700 bg-transparent disabled:opacity-40'
          }`}
          disabled={!isSupabaseConfigured}
          type="button"
        >
          Ligação Supabase {isSupabaseConfigured ? '✓' : '(Inativo)'}
        </button>
        <button
          onClick={() => setIsDemoMode(true)}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            isDemoMode
              ? 'bg-amber-500 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-700 bg-transparent'
          }`}
          type="button"
        >
          Modo Demo / Simulação {isDemoMode ? '• Ativo' : ''}
        </button>
      </div>
    </div>
  );
}

// Section Welcome Hero Message
function SectionWelcome({ session }: { session: SessionUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-3xl p-8 text-white shadow-lg space-y-1"
      id="dashboard-hero-card"
    >
      <p className="text-rose-100 text-xs font-semibold uppercase tracking-wider">
        Gestão Simplificada
      </p>
      <h2 className="text-2xl font-bold tracking-tight">
        O seu dia de trabalho começou, {session.fullName || 'Artista'}!
      </h2>
      <p className="text-rose-100 text-xs text-[11px] leading-relaxed max-w-lg">
        {session.mode === 'real'
          ? 'Tem a ligação ao Supabase ativa. Novos utilizadores registados são de imediato salvaguardados nas tabelas públicas do seu projeto.'
          : 'Está no modo Simulação de Demonstração Interativa. Pode adicionar agendamentos, simular ganhos, remover horários e testar toda a interface de ponta a ponta.'}
      </p>
    </motion.div>
  );
}

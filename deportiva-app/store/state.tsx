import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import { api, getApiUrl } from '../lib/api';

export type Role = 'admin' | 'user';
export type User = { id: string; name: string; email: string; password: string; role: Role; approved: boolean; createdAt: number };
export type Vehicle = { plate: string; ingreso?: string; salida?: string; estado?: string; updatedAt: number };
export type Config = { backgroundUrl?: string };

type State = {
  users: User[];
  vehicles: Vehicle[];
  config: Config;
  currentUser?: User | null;
  token?: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  approveUser: (email: string) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  uploadExcelFromUri: (uri: string) => Promise<{ count: number } | { error: string }>;
  searchByPlate: (q: string) => Promise<Vehicle[]>;
  setBackgroundUrl: (url: string) => Promise<void>;
  saveVehicle: (v: { plate: string; ingreso?: string; salida?: string; estado?: string }) => Promise<{ ok: boolean; message?: string }>;
  deleteVehicleByPlate: (plate: string) => Promise<boolean>;
};

const StateCtx = createContext<State | null>(null);

const USERS_KEY = 'jl_users';
const VEHICLES_KEY = 'jl_vehicles';
const CONFIG_KEY = 'jl_config';
const CURRENT_KEY = 'jl_current';
const TOKEN_KEY = 'jl_token';

function normalizePlate(p: string) {
  return String(p || '').trim().toUpperCase();
}

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [config, setConfig] = useState<Config>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const persist = async () => {
    await AsyncStorage.multiSet([
      [USERS_KEY, JSON.stringify(users)],
      [VEHICLES_KEY, JSON.stringify(vehicles)],
      [CONFIG_KEY, JSON.stringify(config)],
      [CURRENT_KEY, JSON.stringify(currentUser)],
      [TOKEN_KEY, String(token || '')],
    ]);
  };

  useEffect(() => { persist(); }, [users, vehicles, config, currentUser]);
  useEffect(() => { init(); }, []);

  const init = async () => {
    const [[, uTxt], [, vTxt], [, cTxt], [, curTxt], [, tokTxt]] = await AsyncStorage.multiGet([USERS_KEY, VEHICLES_KEY, CONFIG_KEY, CURRENT_KEY, TOKEN_KEY]);
    try { setUsers(uTxt ? JSON.parse(uTxt) : []); } catch {}
    try { setVehicles(vTxt ? JSON.parse(vTxt) : []); } catch {}
    try { setConfig(cTxt ? JSON.parse(cTxt) : {}); } catch {}
    try { setCurrentUser(curTxt ? JSON.parse(curTxt) : null); } catch {}
    try { setToken(tokTxt ? (tokTxt || '') : null); } catch {}

    // Seed admin if not exists
    const hasAdmin = (uTxt ? JSON.parse(uTxt) : []).some((u: User) => u.email === 'admin@admin');
    if (!hasAdmin) {
      const admin: User = { id: 'admin', name: 'Administrador', email: 'admin@admin', password: '123456', role: 'admin', approved: true, createdAt: Date.now() };
      setUsers(prev => [...prev, admin]);
    }
  };

  const login = async (email: string, password: string) => {
    // Intento remoto si hay API_URL configurada
    try {
      const url = getApiUrl();
      if (url) {
        const res = await api<{ ok: boolean; token: string; user: User }>(`/auth/login`, { method: 'POST', body: { email, password } });
        if (res?.ok && res?.user) {
          setCurrentUser(res.user);
          setToken(res.token || null);
          return true;
        }
      }
    } catch {}
    // Fallback local
    const u = users.find(x => x.email.toLowerCase() === String(email).toLowerCase());
    if (!u) return false;
    if (u.password !== String(password)) return false;
    if (u.role !== 'admin' && !u.approved) return false;
    setCurrentUser(u);
    return true;
  };

  const logout = async () => {
    // Conservar placas en almacenamiento, pero cerrar la sesión del usuario
    setCurrentUser(null);
    setToken(null);
    try {
      await AsyncStorage.multiRemove([CURRENT_KEY, TOKEN_KEY]);
    } catch {}
  };

  const register = async (name: string, email: string, password: string) => {
    // Intento remoto
    try {
      const res = await api<{ ok: boolean }>(`/auth/register`, { method: 'POST', body: { name, email, password } });
      if (res?.ok) return { ok: true };
    } catch {}
    const exists = users.some(x => x.email.toLowerCase() === String(email).toLowerCase());
    if (exists) return { ok: false, message: 'Email ya registrado' };
    const user: User = { id: Math.random().toString(36).slice(2), name, email: email.toLowerCase(), password: String(password), role: 'user', approved: false, createdAt: Date.now() };
    setUsers(prev => [...prev, user]);
    return { ok: true };
  };

  const approveUser = async (email: string) => {
    try { await api(`/admin/users/approve`, { method: 'POST', token, body: { email } }); } catch {}
    setUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, approved: true } : u));
    return true;
  };

  const deleteUser = async (id: string) => {
    try { await api(`/admin/users/${id}`, { method: 'DELETE', token }); } catch {}
    setUsers(prev => prev.filter(u => u.id !== id));
    return true;
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try { await api(`/admin/reset-password`, { method: 'POST', token, body: { email, newPassword } }); } catch {}
    setUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: String(newPassword) } : u));
    return true;
  };

  const uploadExcelFromUri = async (uri: string) => {
    try {
      if (currentUser?.role !== 'admin') {
        return { error: 'No autorizado' };
      }
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      // Intento remoto
      try {
        const res = await api<{ ok: boolean; count: number }>(`/admin/vehicles/upload-base64`, { method: 'POST', token, body: { base64 } });
        if (res?.ok) {
          // Después de subir remoto, traer coincidencias locales vacías
          setVehicles([]);
          return { count: res.count } as any;
        }
      } catch {}
      // Fallback local si el backend no está disponible
      const wb = XLSX.read(base64, { type: 'base64' });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const mapped: Vehicle[] = rows.map(r => ({
        plate: normalizePlate(r.placa || r.plate || r.PLACA || r.Plate),
        ingreso: String(r.ingreso || r.Ingreso || r.INGRESO || ''),
        salida: String(r.salida || r.Salida || r.SALIDA || ''),
        estado: String(r.estado || r.Estado || r.ESTADO || '').trim(),
        updatedAt: Date.now(),
      })).filter(x => x.plate);
      setVehicles(mapped);
      return { count: mapped.length };
    } catch (e: any) {
      return { error: e?.message || 'Error leyendo Excel' };
    }
  };

  const searchByPlate = async (q: string) => {
    // No mostrar información si no hay usuario autenticado
    if (!currentUser) return [];
    // Intento remoto público
    try {
      const res = await api<{ ok: boolean; items: Vehicle[] }>(`/vehicles?q=${encodeURIComponent(q)}`);
      if (res?.ok && Array.isArray(res.items)) return res.items;
    } catch {}
    // Fallback local
    const v = vehicles.filter(v => v.plate.includes(normalizePlate(q)));
    return v;
  };

  const setBackgroundUrl = async (url: string) => {
    try { await api(`/admin/config/background`, { method: 'POST', token, body: { url } }); } catch {}
    setConfig(prev => ({ ...prev, backgroundUrl: url }));
  };

  const saveVehicle = async (v: { plate: string; ingreso?: string; salida?: string; estado?: string }) => {
    const plate = normalizePlate(v.plate);
    if (!plate) return { ok: false, message: 'Placa requerida' };
    setVehicles(prev => {
      const idx = prev.findIndex(x => x.plate === plate);
      const next: Vehicle = {
        plate,
        ingreso: v.ingreso ?? (idx >= 0 ? prev[idx].ingreso : ''),
        salida: v.salida ?? (idx >= 0 ? prev[idx].salida : ''),
        estado: (v.estado ?? (idx >= 0 ? prev[idx].estado : '')).trim(),
        updatedAt: Date.now(),
      };
      if (idx >= 0) return prev.map((x, i) => (i === idx ? next : x));
      return [next, ...prev];
    });
    return { ok: true };
  };

  const deleteVehicleByPlate = async (plate: string) => {
    const p = normalizePlate(plate);
    setVehicles(prev => prev.filter(x => x.plate !== p));
    return true;
  };

  const value = useMemo<State>(() => ({
    users, vehicles, config, currentUser, token,
    init, login, logout, register, approveUser, deleteUser, resetPassword,
    uploadExcelFromUri, searchByPlate, setBackgroundUrl, saveVehicle, deleteVehicleByPlate,
  }), [users, vehicles, config, currentUser]);

  return <StateCtx.Provider value={value}>{children}</StateCtx.Provider>;
}

export function useAppState() {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error('StateProvider missing');
  return ctx;
}
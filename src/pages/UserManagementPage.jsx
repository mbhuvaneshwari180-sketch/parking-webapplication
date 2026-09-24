import React, { useState, useEffect } from 'react';
import { adminAPI, masterAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Crown, 
  Shield, 
  UserX, 
  Trash2, 
  ArrowUpDown,
  UserCheck
} from 'lucide-react';

export default function UserManagementPage() {
  const { isMasterAdmin, user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Confirm Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    action: null,
    isDanger: true,
  });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch users directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // Toggle user status (Active vs Suspended)
  const handleToggleStatus = (targetUser) => {
    const nextStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setModalConfig({
      title: `${nextStatus === 'SUSPENDED' ? 'Suspend' : 'Reactivate'} Account`,
      message: `Are you sure you want to change the status of ${targetUser.name} (${targetUser.email}) to ${nextStatus}?`,
      isDanger: nextStatus === 'SUSPENDED',
      action: async () => {
        setModalLoading(true);
        try {
          if (isMasterAdmin) {
            await masterAPI.updateUserStatus(targetUser.id, nextStatus);
          } else {
            await adminAPI.updateUserStatus(targetUser.id, nextStatus);
          }
          setModalOpen(false);
          await fetchUsers();
        } catch (err) {
          alert(err.response?.data?.error || 'Action failed');
        } finally {
          setModalLoading(false);
        }
      },
    });
    setModalOpen(true);
  };

  // Master Admin change role
  const handleChangeRole = async (targetUser, newRole) => {
    if (!isMasterAdmin) return;
    try {
      await masterAPI.updateUserRole(targetUser.id, newRole);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user role');
    }
  };

  // Master Admin hard-delete
  const handleDeleteUser = (targetUser) => {
    if (!isMasterAdmin) return;
    setModalConfig({
      title: 'Permanently Delete Account',
      message: `CAUTION: Hard-deleting user ${targetUser.name} (${targetUser.email}) will remove their profile and cascade remove their parkings and bookings permanently.`,
      isDanger: true,
      action: async () => {
        setModalLoading(true);
        try {
          await masterAPI.deleteUser(targetUser.id);
          setModalOpen(false);
          await fetchUsers();
        } catch (err) {
          alert(err.response?.data?.error || 'Failed to delete user');
        } finally {
          setModalLoading(false);
        }
      },
    });
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">User Governance & Access</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Audit identities, manage authorization roles, and enforce account suspensions
          </p>
        </div>

        {isMasterAdmin && (
          <span className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-700 text-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/10">
            <Crown className="w-4 h-4 text-amber-400" />
            Super-Admin Role Control Active
          </span>
        )}
      </div>

      {/* Filter Row */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or email address..."
            className="w-full bg-slate-950 text-white pl-9 pr-4 py-2 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="">All Roles</option>
            <option value="COMMUTER">Commuters</option>
            <option value="OWNER">Owners</option>
            <option value="ADMIN">Admins</option>
            <option value="MASTER_ADMIN">Master Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading directory records...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No accounts match the current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Activity</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isSuspended = u.status === 'SUSPENDED';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[9px] bg-slate-800 text-sky-400 px-1.5 py-0.2 rounded border border-slate-700">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>

                      {/* Role Column */}
                      <td className="py-3.5 px-4">
                        {isMasterAdmin && !isSelf ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u, e.target.value)}
                            className="bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-purple-500 font-semibold cursor-pointer"
                          >
                            <option value="COMMUTER">COMMUTER</option>
                            <option value="OWNER">OWNER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="MASTER_ADMIN">MASTER_ADMIN</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'MASTER_ADMIN'
                                ? 'bg-purple-950 text-purple-300 border border-purple-700'
                                : u.role === 'ADMIN'
                                ? 'bg-blue-950 text-blue-300 border border-blue-700'
                                : u.role === 'OWNER'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {isSuspended ? (
                            <>
                              <ShieldAlert className="w-3 h-3" /> Suspended
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </>
                          )}
                        </span>
                      </td>

                      {/* Activity counts */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <div>{u._count?.bookings || 0} bookings</div>
                        {u.role === 'OWNER' && <div>{u._count?.parkings || 0} facilities</div>}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        {!isSelf && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                                isSuspended
                                  ? 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                                  : 'bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300'
                              }`}
                            >
                              {isSuspended ? 'Reactivate' : 'Suspend'}
                            </button>

                            {isMasterAdmin && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 transition-colors"
                                title="Hard Delete Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText="Confirm Action"
        isDanger={modalConfig.isDanger}
        isLoading={modalLoading}
        onConfirm={modalConfig.action}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

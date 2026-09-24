import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { masterAPI } from '../services/api';
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronLeft, 
  ShieldAlert, 
  Clock, 
  User, 
  Code,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function AuditLogViewerPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionQuery, setActionQuery] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (actionQuery) params.action = actionQuery;
      if (targetQuery) params.target = targetQuery;

      const res = await masterAPI.getAuditLogs(params);
      setLogs(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch audit log trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/master/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Master Console
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-purple-400" />
            Audit Log Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Immutable, tamper-evident record of all administrative overrides, role promotions, and platform actions.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-200">
          Showing {logs.length} logged mutations
        </span>
      </div>

      {/* Filter Row */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-slate-900 border border-purple-900/40 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3 items-center"
      >
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={actionQuery}
            onChange={(e) => setActionQuery(e.target.value)}
            placeholder="Filter by action (e.g. OVERRIDE, ROLE, USER)..."
            className="w-full bg-slate-950 text-white pl-9 pr-4 py-2 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={targetQuery}
            onChange={(e) => setTargetQuery(e.target.value)}
            placeholder="Filter by target entity (e.g. USER, BOOKING)..."
            className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          Search Ledger
        </button>
      </form>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-purple-900/40 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-purple-300">Decrypting audit entries...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No audit log records match the search filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-purple-400" />
                            <span>{log.actor?.name || 'System Engine'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{log.actor?.email}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-800/80">
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-purple-300">
                          {log.target}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {log.metadata ? (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700"
                            >
                              {isExpanded ? 'Hide Payload' : 'View Payload'}
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Payload Viewer */}
                      {isExpanded && log.metadata && (
                        <tr className="bg-slate-950/80">
                          <td colSpan="5" className="p-4 border-b border-purple-900/30">
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                                <Code className="w-3.5 h-3.5" />
                                <span>Mutating Action Payload & Diff:</span>
                              </div>
                              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-3 bg-slate-950 rounded-lg border border-slate-800">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

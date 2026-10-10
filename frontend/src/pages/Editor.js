import React, { useState, useEffect, useContext } from 'react';
import MonacoEditor from '@monaco-editor/react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Play, RotateCcw, Clock, Cpu, CheckCircle2, XCircle, AlertCircle, Terminal, LogOut, ShieldCheck, History as HistoryIcon, Code2 } from 'lucide-react';

const STARTER_CODES = {
  Python: `# Python 3.11 Execution Sandbox
import sys

# Read input from custom stdin
name = sys.stdin.read().strip() or "World"
print(f"Hello, {name} from CodeNova Secure Sandbox!")
`,
  Java: `// OpenJDK 17 Execution Sandbox
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String name = scanner.hasNext() ? scanner.next() : "World";
        System.out.println("Hello, " + name + " from CodeNova Secure Sandbox!");
    }
}
`,
  'C++': `// GCC C++20 Execution Sandbox
#include <iostream>
#include <string>

int main() {
    std::string name;
    if (!(std::cin >> name)) {
        name = "World";
    }
    std::cout << "Hello, " << name << " from CodeNova Secure Sandbox!" << std::endl;
    return 0;
}
`,
  JavaScript: `// Node.js 18 LTS Execution Sandbox
const fs = require('fs');

const stdin = fs.readFileSync(0, 'utf-8').trim();
const name = stdin.length > 0 ? stdin : 'World';
console.log(\`Hello, \${name} from CodeNova Secure Sandbox!\`);
`
};

export default function Editor() {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState(null);
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('CodeNova');
  const [activeTab, setActiveTab] = useState('output'); // 'output' or 'stdin'
  
  const [executionState, setExecutionState] = useState({
    status: 'idle', // 'idle', 'queued', 'running', 'completed', 'failed'
    stdout: '',
    stderr: '',
    exitCode: null,
    executionTime: null,
    memoryUsed: null,
    submissionId: null
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await api.get('/languages');
        setLanguages(res.data);
        if (res.data.length > 0) {
          const defaultLang = res.data[0];
          setSelectedLang(defaultLang);
          setCode(STARTER_CODES[defaultLang.name] || '# Write code here');
        }
      } catch (err) {
        console.error('Failed to load languages', err);
      }
    };
    fetchLanguages();
  }, []);

  const handleLanguageChange = (e) => {
    const langId = parseInt(e.target.value, 10);
    const lang = languages.find(l => l.id === langId);
    if (lang) {
      setSelectedLang(lang);
      // If code was untouched or matches a starter, switch starter
      setCode(STARTER_CODES[lang.name] || '');
    }
  };

  const handleRun = async () => {
    if (!selectedLang) return;
    setLoading(true);
    setActiveTab('output');
    setExecutionState({
      status: 'queued',
      stdout: '',
      stderr: '',
      exitCode: null,
      executionTime: null,
      memoryUsed: null,
      submissionId: null
    });

    try {
      // Sub-100ms async submission (FR-04)
      const res = await api.post('/submissions', {
        languageId: selectedLang.id,
        code,
        stdin
      });

      const { submissionId } = res.data;
      setExecutionState(prev => ({ ...prev, status: 'queued', submissionId }));
      pollResult(submissionId);
    } catch (err) {
      setLoading(false);
      setExecutionState(prev => ({
        ...prev,
        status: 'failed',
        stderr: err.response?.data?.error || err.message
      }));
    }
  };

  const pollResult = (subId) => {
    const startTime = Date.now();
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/submissions/${subId}`);
        const { status, result } = res.data;

        if (status === 'running') {
          setExecutionState(prev => ({ ...prev, status: 'running' }));
        }

        if (status === 'completed' || status === 'failed') {
          clearInterval(interval);
          setLoading(false);
          setExecutionState({
            status,
            stdout: result?.stdout || '',
            stderr: result?.stderr || '',
            exitCode: result?.exitCode ?? (status === 'completed' ? 0 : 1),
            executionTime: result?.executionTime ?? (Date.now() - startTime),
            memoryUsed: result?.memoryUsed || 0,
            submissionId: subId
          });
        }

        // Safety timeout polling client-side after 15 seconds
        if (Date.now() - startTime > 15000) {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        clearInterval(interval);
        setLoading(false);
        setExecutionState(prev => ({
          ...prev,
          status: 'failed',
          stderr: 'Network error polling sandbox execution result.'
        }));
      }
    }, 1200);
  };

  const getMonacoLanguage = (name) => {
    if (!name) return 'javascript';
    const n = name.toLowerCase();
    if (n.includes('python')) return 'python';
    if (n.includes('java') && !n.includes('script')) return 'java';
    if (n.includes('c++') || n.includes('cpp')) return 'cpp';
    return 'javascript';
  };

  const isAdmin = user && (user.role === 'admin' || user.roleId === 1 || user.username === 'admin');

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-slate-200">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#161b22] border-b border-gray-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
            <Code2 size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-wide">CodeNova</span>
              <span className="text-[11px] font-semibold bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full">v1.0 Cloud</span>
            </div>
            <p className="text-xs text-gray-400">Secure Sandboxed Code Execution Platform</p>
          </div>
        </div>

        {/* Center Controls: Language selector + Run */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              className="bg-[#21262d] border border-gray-700 text-white text-sm font-medium rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition hover:border-gray-500"
              value={selectedLang?.id || ''}
              onChange={handleLanguageChange}
            >
              {languages.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.version})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRun}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-md ${
              loading 
                ? 'bg-amber-600/60 text-white cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-600/30'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>

        {/* Right Navigation & Profile */}
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition"
          >
            <HistoryIcon size={16} />
            <span>History</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition"
            >
              <ShieldCheck size={16} />
              <span>Admin Panel</span>
            </Link>
          )}

          <div className="h-5 w-[1px] bg-gray-700 mx-1"></div>

          <span className="text-xs text-gray-400 font-mono">
            {user?.username} ({user?.role || 'user'})
          </span>

          <button
            onClick={() => { logoutUser(); navigate('/login'); }}
            title="Sign out"
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace (Editor + Output/Stdin Panel) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Monaco Code Editor */}
        <div className="flex-1 flex flex-col border-r border-gray-800 bg-[#0d1117]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800 text-xs font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Source Editor — {selectedLang?.name || 'Code'}</span>
            </div>
            <button
              onClick={() => selectedLang && setCode(STARTER_CODES[selectedLang.name] || '')}
              className="flex items-center gap-1 hover:text-gray-200 transition"
              title="Reset to Starter Template"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex-1 relative">
            <MonacoEditor
              height="100%"
              language={getMonacoLanguage(selectedLang?.name)}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>

        {/* Right: Dual Tabs for Custom Stdin and Output Terminal */}
        <div className="w-[450px] lg:w-[500px] flex flex-col bg-[#0b0e14]">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800 text-xs">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('output')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                  activeTab === 'output' 
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <Terminal size={14} />
                <span>Console Output</span>
              </button>
              <button
                onClick={() => setActiveTab('stdin')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                  activeTab === 'stdin' 
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <Code2 size={14} />
                <span>Custom Stdin (FR-03)</span>
                {stdin.trim().length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
              </button>
            </div>

            {/* Execution status indicator badge */}
            <div>
              {executionState.status === 'queued' && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  <AlertCircle size={12} /> QUEUED
                </span>
              )}
              {executionState.status === 'running' && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded">
                  <div className="animate-spin rounded-full h-2.5 w-2.5 border-2 border-blue-400 border-t-transparent"></div>
                  SANDBOX RUNNING
                </span>
              )}
              {executionState.status === 'completed' && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  <CheckCircle2 size={12} /> SUCCESS
                </span>
              )}
              {executionState.status === 'failed' && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
                  <XCircle size={12} /> FAILED
                </span>
              )}
            </div>
          </div>

          {/* Tab Content: Output Terminal vs Custom Stdin */}
          {activeTab === 'stdin' ? (
            <div className="flex-1 flex flex-col p-4 bg-[#090d16]">
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-300">Custom Standard Input (stdin)</span>
                <p className="text-[11px] text-gray-500">Provide input data to be passed into the container execution via standard input stream.</p>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter standard input data here..."
                rows={12}
                className="flex-1 w-full bg-[#161b22] text-slate-100 font-mono text-sm p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#090d16]">
              {/* Telemetry Metrics Bar */}
              {executionState.exitCode !== null && (
                <div className="flex items-center gap-4 px-4 py-2 bg-[#121824] border-b border-gray-800/80 text-[11px] font-mono">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock size={12} className="text-indigo-400" />
                    <span>Time: <strong className="text-slate-200">{executionState.executionTime}ms</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Cpu size={12} className="text-indigo-400" />
                    <span>Memory: <strong className="text-slate-200">{executionState.memoryUsed} KB</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <span>Exit: <strong className={executionState.exitCode === 0 ? 'text-emerald-400' : 'text-rose-400'}>{executionState.exitCode}</strong></span>
                  </div>
                </div>
              )}

              {/* Terminal Logs */}
              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs select-text">
                {executionState.status === 'idle' && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                    <Terminal size={32} />
                    <p>Press "Run Code" to compile and execute in Docker sandbox</p>
                  </div>
                )}

                {executionState.status === 'queued' && (
                  <div className="flex items-center gap-2 text-amber-400">
                    <div className="animate-pulse">●</div>
                    <span>Job enqueued to Redis Bull Queue. Waiting for execution worker...</span>
                  </div>
                )}

                {executionState.status === 'running' && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-400 border-t-transparent"></div>
                    <span>Container spawned (--network none, 256MB RAM, 1.0 vCPU). Executing...</span>
                  </div>
                )}

                {executionState.stdout && (
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">STDOUT</span>
                    <pre className="text-emerald-400 whitespace-pre-wrap mt-1 leading-relaxed">{executionState.stdout}</pre>
                  </div>
                )}

                {executionState.stderr && (
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">STDERR</span>
                    <pre className="text-rose-400 whitespace-pre-wrap mt-1 leading-relaxed bg-rose-950/20 p-2 rounded border border-rose-900/40">{executionState.stderr}</pre>
                  </div>
                )}

                {executionState.status === 'completed' && !executionState.stdout && !executionState.stderr && (
                  <div className="text-gray-500 italic">Program executed successfully with no output returned.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

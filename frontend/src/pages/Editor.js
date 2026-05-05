import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function Editor() {
  const [languages, setLanguages] = useState([]);
  const [languageId, setLanguageId] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      const res = await api.get('/languages');
      setLanguages(res.data);
      if (res.data.length > 0) {
        setLanguageId(res.data[0].id.toString());
      }
    };
    fetchLanguages();
  }, []);

  const handleRun = async () => {
    setLoading(true);
    setOutput('Submitting...');
    try {
      const res = await api.post('/submissions', {
        languageId: parseInt(languageId),
        code
      });
      
      const subId = res.data.submissionId;
      pollResult(subId);
    } catch (err) {
      setOutput('Error: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const pollResult = async (id) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/submissions/${id}`);
        const status = res.data.status;
        if (status === 'completed' || status === 'failed') {
          clearInterval(interval);
          setLoading(false);
          const result = res.data.result;
          if (result) {
            setOutput(`Exit Code: ${result.exitCode}\n\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
          } else {
            setOutput('Execution completed but no result found.');
          }
        } else {
          setOutput(`Status: ${status}...`);
        }
      } catch (err) {
        clearInterval(interval);
        setLoading(false);
        setOutput('Error fetching result.');
      }
    }, 2000);
  };

  const selectedLangName = languages.find(l => l.id.toString() === languageId)?.name.toLowerCase() || 'javascript';
  const monacoLang = selectedLangName === 'c++' ? 'cpp' : selectedLangName;

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 bg-dark border-b border-gray-800">
        <h1 className="text-xl font-bold text-primary">Codenova Editor</h1>
        <div className="flex gap-4 items-center">
          <Link to="/history" className="text-sm hover:text-white">History</Link>
          <select 
            className="bg-darker border border-gray-700 p-2 rounded text-white"
            value={languageId} 
            onChange={(e) => setLanguageId(e.target.value)}
          >
            {languages.map(l => <option key={l.id} value={l.id}>{l.name} ({l.version})</option>)}
          </select>
          <button 
            onClick={handleRun} 
            disabled={loading}
            className={`px-4 py-2 rounded font-bold text-white ${loading ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500'}`}
          >
            {loading ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 border-r border-gray-800">
          <MonacoEditor
            height="100%"
            language={monacoLang}
            theme="vs-dark"
            value={code}
            onChange={setCode}
            options={{ minimap: { enabled: false }, fontSize: 16 }}
          />
        </div>
        <div className="w-1/3 bg-darker p-4 overflow-auto">
          <h2 className="text-lg mb-2 font-bold text-gray-400">Terminal Output</h2>
          <pre className="text-sm text-green-400 whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </div>
  );
}

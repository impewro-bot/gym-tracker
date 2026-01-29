import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dumbbell, TrendingUp, MessageCircle, Send, Trophy, Calendar, Plus, Pencil, Trash2, X, Check, Settings, ClipboardList, Download, Upload } from 'lucide-react';

const PPL_EXERCISES = {
  Push: [
    { id: 1, name: 'Bench Press', defaultSets: 3, defaultReps: 8 },
    { id: 2, name: 'Incline Dumbbell Press', defaultSets: 3, defaultReps: 10 },
    { id: 3, name: 'Overhead Press', defaultSets: 3, defaultReps: 8 },
    { id: 4, name: 'Dips', defaultSets: 3, defaultReps: 10 },
    { id: 5, name: 'Lateral Raises', defaultSets: 3, defaultReps: 12 },
    { id: 6, name: 'Tricep Pushdown', defaultSets: 3, defaultReps: 12 },
    { id: 7, name: 'Overhead Tricep Extension', defaultSets: 3, defaultReps: 12 },
  ],
  Pull: [
    { id: 10, name: 'Pull-ups', defaultSets: 3, defaultReps: 8 },
    { id: 11, name: 'Lat Pulldown', defaultSets: 3, defaultReps: 10 },
    { id: 12, name: 'Barbell Row', defaultSets: 3, defaultReps: 8 },
    { id: 13, name: 'Cable Row', defaultSets: 3, defaultReps: 10 },
    { id: 14, name: 'Face Pulls', defaultSets: 3, defaultReps: 15 },
    { id: 15, name: 'EZ-Bar Curls', defaultSets: 3, defaultReps: 10 },
    { id: 16, name: 'Hammer Curls', defaultSets: 3, defaultReps: 10 },
    { id: 17, name: 'Chin-ups', defaultSets: 3, defaultReps: 8 },
  ],
  Legs: [
    { id: 20, name: 'Squat', defaultSets: 3, defaultReps: 5 },
    { id: 21, name: 'Romanian Deadlift', defaultSets: 3, defaultReps: 10 },
    { id: 22, name: 'Leg Press', defaultSets: 3, defaultReps: 10 },
    { id: 23, name: 'Leg Curl', defaultSets: 3, defaultReps: 10 },
    { id: 24, name: 'Leg Extension', defaultSets: 3, defaultReps: 12 },
    { id: 25, name: 'Calf Raises', defaultSets: 4, defaultReps: 15 },
    { id: 26, name: 'Bulgarian Split Squat', defaultSets: 3, defaultReps: 10 },
    { id: 27, name: 'Deadlift', defaultSets: 3, defaultReps: 5 },
  ]
};

const INITIAL_MESSAGE = { role: 'assistant', content: "Hey! Log your workout in shorthand:\n\n• \"Bench 8,8,7 at 65kg\"\n• \"Pull-ups 8,7,6, felt heavy\"\n• \"Lat pulldown 10,10,9, smooth\"\n\nAdd notes after a comma (optional) — I'll factor them into progression.\n\nTap 📋 for progress report.\n\nWhat's today — Push, Pull, or Legs?" };

const SAMPLE_HISTORY = [
  { id: 1, date: '2025-01-20', day: 'Push', exercise: 'Bench Press', sets: [{r:8,w:60},{r:8,w:60},{r:7,w:60}], notes: '' },
  { id: 2, date: '2025-01-20', day: 'Push', exercise: 'Overhead Press', sets: [{r:8,w:40},{r:8,w:40},{r:6,w:40}], notes: 'felt heavy' },
  { id: 3, date: '2025-01-21', day: 'Pull', exercise: 'Pull-ups', sets: [{r:8,w:0},{r:7,w:0},{r:6,w:0}], notes: '' },
  { id: 4, date: '2025-01-21', day: 'Pull', exercise: 'Lat Pulldown', sets: [{r:9,w:82},{r:9,w:82},{r:9,w:82}], notes: '' },
  { id: 5, date: '2025-01-21', day: 'Pull', exercise: 'EZ-Bar Curls', sets: [{r:9,w:25},{r:8,w:25},{r:7,w:25}], notes: 'cheated last rep' },
  { id: 6, date: '2025-01-22', day: 'Legs', exercise: 'Squat', sets: [{r:5,w:100},{r:5,w:100},{r:5,w:100}], notes: '' },
  { id: 7, date: '2025-01-24', day: 'Push', exercise: 'Bench Press', sets: [{r:8,w:62.5},{r:8,w:62.5},{r:8,w:62.5}], notes: 'smooth' },
  { id: 8, date: '2025-01-25', day: 'Pull', exercise: 'Pull-ups', sets: [{r:8,w:0},{r:7,w:0},{r:6,w:0}], notes: '' },
  { id: 9, date: '2025-01-25', day: 'Pull', exercise: 'Lat Pulldown', sets: [{r:10,w:82},{r:10,w:82},{r:9,w:82}], notes: '' },
  { id: 10, date: '2025-01-25', day: 'Pull', exercise: 'EZ-Bar Curls', sets: [{r:10,w:25},{r:10,w:25},{r:9,w:25}], notes: 'clean reps' },
];

export default function GymTracker() {
  const [tab, setTab] = useState('chat');
  const [exercises, setExercises] = useState(() => {
    try {
      const saved = localStorage.getItem('gym-exercises');
      return saved ? JSON.parse(saved) : PPL_EXERCISES;
    } catch { return PPL_EXERCISES; }
  });
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('gym-history');
      return saved ? JSON.parse(saved) : SAMPLE_HISTORY;
    } catch { return SAMPLE_HISTORY; }
  });
  const [exerciseModal, setExerciseModal] = useState(false);
  const [editExercise, setEditExercise] = useState(null);
  const [newExercise, setNewExercise] = useState({ name: '', day: 'Push', defaultReps: 10 });
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('gym-messages');
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
    } catch { return [INITIAL_MESSAGE]; }
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try { localStorage.setItem('gym-history', JSON.stringify(history)); } catch {}
  }, [history]);
  
  useEffect(() => {
    try { localStorage.setItem('gym-exercises', JSON.stringify(exercises)); } catch {}
  }, [exercises]);
  
  useEffect(() => {
    try { localStorage.setItem('gym-messages', JSON.stringify(messages)); } catch {}
  }, [messages]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentDay, setCurrentDay] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ date: new Date().toISOString().split('T')[0], day: 'Push', exercise: '', sets: [{r:'',w:''}], notes: '' });
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const clearAllData = () => {
    if (confirm('Clear all workout history, exercises, and chat? This cannot be undone.')) {
      setHistory([]);
      setExercises(PPL_EXERCISES);
      setMessages([INITIAL_MESSAGE]);
      try {
        localStorage.removeItem('gym-history');
        localStorage.removeItem('gym-exercises');
        localStorage.removeItem('gym-messages');
      } catch {}
    }
  };

  const exportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      history,
      exercises,
      messages
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (!data.history || !data.exercises) {
          alert('Invalid backup file format');
          return;
        }
        
        if (confirm('This will replace all your current data. Continue?')) {
          setHistory(data.history || []);
          setExercises(data.exercises || PPL_EXERCISES);
          setMessages(data.messages || [INITIAL_MESSAGE]);
          alert('Data imported successfully!');
        }
      } catch (err) {
        alert('Error reading backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const allExercises = [...exercises.Push, ...exercises.Pull, ...exercises.Legs];

  const addExercise = () => {
    if (!newExercise.name.trim()) return;
    const ex = { id: Date.now(), name: newExercise.name.trim(), defaultSets: 3, defaultReps: parseInt(newExercise.defaultReps) || 10 };
    setExercises(prev => ({ ...prev, [newExercise.day]: [...prev[newExercise.day], ex] }));
    setNewExercise({ name: '', day: 'Push', defaultReps: 10 });
  };

  const saveExerciseEdit = () => {
    if (!editExercise || !editExercise.name.trim()) return;
    setExercises(prev => {
      const updated = { ...prev };
      // Remove from old day if day changed
      Object.keys(updated).forEach(day => {
        updated[day] = updated[day].filter(e => e.id !== editExercise.id);
      });
      // Add to new day
      updated[editExercise.day] = [...updated[editExercise.day], { 
        id: editExercise.id, 
        name: editExercise.name.trim(), 
        defaultSets: 3, 
        defaultReps: parseInt(editExercise.defaultReps) || 10 
      }];
      return updated;
    });
    setEditExercise(null);
  };

  const deleteExercise = (day, id) => {
    setExercises(prev => ({ ...prev, [day]: prev[day].filter(e => e.id !== id) }));
  };

  const getPRs = () => {
    const prs = {};
    history.forEach(w => {
      const maxWeight = Math.max(...w.sets.map(s => s.w));
      if (!prs[w.exercise] || maxWeight > prs[w.exercise].weight) {
        prs[w.exercise] = { weight: maxWeight, date: w.date };
      }
    });
    return prs;
  };

  const getChartData = (exerciseName) => {
    return history
      .filter(h => h.exercise === exerciseName)
      .map(h => ({ 
        date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        weight: Math.max(...h.sets.map(s => s.w)),
        volume: h.sets.reduce((acc, s) => acc + (s.r * s.w), 0)
      }));
  };

  const formatLastSession = () => {
    // Get only the most recent session per exercise (last workout day for each PPL)
    const lastPush = history.filter(h => h.day === 'Push').slice(-5);
    const lastPull = history.filter(h => h.day === 'Pull').slice(-5);
    const lastLegs = history.filter(h => h.day === 'Legs').slice(-5);
    
    const format = (workouts) => workouts.map(w => 
      `${w.exercise}: ${w.sets.map(s => `${s.r}${s.w > 0 ? `@${s.w}kg` : ''}`).join(', ')}${w.notes ? ` [${w.notes}]` : ''}`
    ).join('\n');

    return `Last Push session:\n${format(lastPush) || 'None'}\n\nLast Pull session:\n${format(lastPull) || 'None'}\n\nLast Legs session:\n${format(lastLegs) || 'None'}`;
  };

  const formatFullHistory = () => {
    const grouped = {};
    history.slice(-30).forEach(h => {
      const key = `${h.date}-${h.day}`;
      if (!grouped[key]) grouped[key] = { date: h.date, day: h.day, exercises: [] };
      grouped[key].exercises.push({ name: h.exercise, sets: h.sets, notes: h.notes });
    });
    return Object.values(grouped).map(s => 
      `${s.date} (${s.day}):\n${s.exercises.map(e => `  ${e.name}: ${e.sets.map(set => `${set.r}${set.w > 0 ? `@${set.w}kg` : ''}`).join(', ')}${e.notes ? ` [${e.notes}]` : ''}`).join('\n')}`
    ).join('\n\n');
  };

  const deleteWorkout = (id) => {
    setHistory(h => h.filter(w => w.id !== id));
  };

  const saveEdit = () => {
    if (!editModal) return;
    setHistory(h => h.map(w => w.id === editModal.id ? editModal : w));
    setEditModal(null);
  };

  const addWorkout = () => {
    if (!newWorkout.exercise || newWorkout.sets.every(s => !s.r)) return;
    const workout = {
      id: Date.now(),
      date: newWorkout.date,
      day: newWorkout.day,
      exercise: newWorkout.exercise,
      sets: newWorkout.sets.filter(s => s.r).map(s => ({ r: parseInt(s.r) || 0, w: parseFloat(s.w) || 0 })),
      notes: newWorkout.notes || ''
    };
    setHistory(h => [...h, workout].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setNewWorkout({ date: new Date().toISOString().split('T')[0], day: 'Push', exercise: '', sets: [{r:'',w:''}], notes: '' });
    setAddModal(false);
  };

  const updateEditSet = (i, field, val) => {
    const newSets = [...editModal.sets];
    newSets[i] = { ...newSets[i], [field]: field === 'r' ? parseInt(val) || 0 : parseFloat(val) || 0 };
    setEditModal({ ...editModal, sets: newSets });
  };

  const addEditSet = () => {
    setEditModal({ ...editModal, sets: [...editModal.sets, { r: 0, w: editModal.sets[0]?.w || 0 }] });
  };

  const removeEditSet = (i) => {
    if (editModal.sets.length > 1) {
      setEditModal({ ...editModal, sets: editModal.sets.filter((_, idx) => idx !== i) });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    const contextToUse = formatLastSession();

    const systemPrompt = `You are a gym coach AI for a Push/Pull/Legs workout tracker. ALL WEIGHTS ARE IN KG. Be concise.

EXERCISES BY DAY:
Push: ${exercises.Push.map(e => e.name).join(', ')}
Pull: ${exercises.Pull.map(e => e.name).join(', ')}
Legs: ${exercises.Legs.map(e => e.name).join(', ')}

LAST SESSION DATA (notes in [brackets] indicate how it felt):
${contextToUse}

YOUR JOB:
1. Parse shorthand workout logs like "lat pulldown 10,10,9" or "bench 8,8,7 at 65kg" or "pull-ups same as last"
2. User can add notes after a comma, e.g. "bench 8,8,7 at 65kg, felt heavy" or "curls 10,10,9, cheated last rep"
3. When user says "same as last", use the exact same sets/reps/weight from their last session
4. If no weight specified, use the weight from their last session for that exercise
5. Compare to last session and give feedback
6. Suggest next session targets — FACTOR IN NOTES (if "felt heavy" or "cheated" → don't rush progression)

RESPONSE FORMAT when logging workouts:
First output a JSON block (include notes if user mentioned any):
\`\`\`json
{"workouts":[{"exercise":"Lat Pulldown","day":"Pull","sets":[{"r":10,"w":82},{"r":10,"w":82},{"r":9,"w":82}],"notes":"felt smooth"}]}
\`\`\`

Then respond in this format:

Logged 👍

🧾 [Day] Day

1️⃣ [Exercise Name]
[Weight] kg → [reps] (Last: [previous reps])
[Brief status: ✅ Progress / ➡️ Steady / ⚠️ Down]
🔜 Next: [specific target]

PROGRESSION PHILOSOPHY (be flexible, factor in notes):
- Notes like "felt heavy", "grind", "struggled" → hold weight or even slightly reduce, focus on clean reps
- Notes like "cheated", "bad form", "swung" → don't count as real progress, repeat or reduce
- Notes like "smooth", "easy", "clean" → good sign to progress
- Notes like "tired", "bad sleep", "off day" → don't judge harshly, suggest repeat
- No notes = neutral, judge by numbers only
- Progress can be: +1 rep, +0.5-1.25kg micro-load, +2.5kg, or same weight with better form
- Rep PRs matter too — not just weight
- Match the user's pace

Keep responses SHORT. No paragraphs. Bullet points only when logging.`;


    try {
      const conversationHistory = messages.slice(1).map(m => ({ 
        role: m.role, 
        content: m.content 
      }));
      conversationHistory.push({ role: 'user', content: userMsg.content });

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.GROQ_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1500,
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
          ]
        })
      });
      const data = await res.json();
      
      if (data.error) {
        console.error('Groq API Error:', data.error);
        throw new Error(data.error.message);
      }
      
      const assistantContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Check console for errors.";
      
      const jsonMatch = assistantContent.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        try {
          const action = JSON.parse(jsonMatch[1]);
          if (action.workouts && Array.isArray(action.workouts)) {
            const today = new Date().toISOString().split('T')[0];
            const newWorkouts = action.workouts.map((w, i) => ({
              id: Date.now() + i,
              date: today,
              day: w.day || currentDay || 'Push',
              exercise: w.exercise,
              sets: w.sets,
              notes: w.notes || ''
            }));
            setHistory(h => [...h, ...newWorkouts]);
            if (action.workouts[0]?.day) setCurrentDay(action.workouts[0].day);
          }
        } catch (e) { console.error('Parse error:', e); }
      }
      
      const cleanContent = assistantContent.replace(/```json\n?[\s\S]*?\n?```\n?/g, '').trim();
      setMessages(m => [...m, { role: 'assistant', content: cleanContent }]);
    } catch (e) {
      console.error('Error:', e);
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${e.message || 'Connection failed. Please try again.'}` }]);
    }
    setLoading(false);
  };

  const getProgressReport = async () => {
    if (loading) return;
    setLoading(true);
    
    const reportPrompt = `You are a gym coach. Give a brief progress report based on this workout history. ALL WEIGHTS IN KG. Notes in [brackets] indicate how exercises felt.

WORKOUT HISTORY (last 30 sessions):
${formatFullHistory()}

Provide:
1. 📊 Quick stats (sessions per week, consistency)
2. 💪 Top 3 exercises with most progress (weight or rep gains)
3. ⚠️ Any exercises that stalled, dropped, or had concerning notes (heavy, cheated, etc.)
4. 🎯 Focus areas for next week (factor in notes — if lots of "heavy" notes, maybe deload)

Keep it SHORT and actionable. Use bullet points. No fluff.`;

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.GROQ_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          messages: [{ role: 'user', content: reportPrompt }]
        })
      });
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      const reportContent = data.choices?.[0]?.message?.content || "Couldn't generate report.";
      setMessages(m => [...m, { role: 'assistant', content: `📈 **Progress Report**\n\n${reportContent}` }]);
    } catch (e) {
      console.error('Error:', e);
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const prs = getPRs();
  const recentByDay = { Push: [], Pull: [], Legs: [] };
  history.forEach(h => { if (recentByDay[h.day]) recentByDay[h.day].push(h); });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-600 rounded-xl"><Dumbbell size={24} /></div>
            <div>
              <h1 className="text-xl font-bold">Gym Tracker</h1>
              <p className="text-xs text-zinc-500">Push / Pull / Legs</p>
            </div>
          </div>
          <button onClick={() => setExerciseModal(true)} className="p-2.5 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors">
            <Settings size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {[['chat', MessageCircle, 'Coach'], ['progress', TrendingUp, 'Progress'], ['history', Calendar, 'History']].map(([id, Icon, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${tab === id ? 'bg-violet-600' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>
              <Icon size={16} /><span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        {tab === 'chat' && (
          <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col h-[calc(100vh-180px)] min-h-[500px]">
            <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-violet-600' : 'bg-zinc-800'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 p-3 rounded-2xl text-sm text-zinc-400 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                      <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={getProgressReport} disabled={loading}
                className="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition-colors" title="Get Progress Report">
                <ClipboardList size={18} className="text-zinc-400" />
              </button>
              <input value={input} onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Log workout: bench 8,8,7 at 65kg..." 
                className="flex-1 bg-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <button onClick={sendMessage} disabled={loading} 
                className="p-3 bg-violet-600 rounded-xl hover:bg-violet-500 disabled:opacity-50 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {tab === 'progress' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {['Push', 'Pull', 'Legs'].map(day => (
                <div key={day} className={`p-3 rounded-xl text-center ${currentDay === day ? 'bg-violet-600' : 'bg-zinc-900'}`}>
                  <div className="text-xs text-zinc-400">{day}</div>
                  <div className="text-lg font-bold">{recentByDay[day].length}</div>
                  <div className="text-xs text-zinc-500">sessions</div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 rounded-2xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" />PRs
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(prs).filter(([_, pr]) => pr.weight > 0).slice(0, 8).map(([ex, pr]) => (
                  <div key={ex} className="bg-zinc-800 rounded-xl p-2.5">
                    <div className="text-xs text-zinc-400 truncate">{ex}</div>
                    <div className="text-base font-bold text-violet-400">{pr.weight} kg</div>
                  </div>
                ))}
              </div>
            </div>

            {['Bench Press', 'Squat', 'Lat Pulldown'].map(ex => {
              const data = getChartData(ex);
              if (data.length < 2) return null;
              return (
                <div key={ex} className="bg-zinc-900 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm">{ex}</h3>
                    {prs[ex] && <span className="text-xs text-violet-400">PR: {prs[ex].weight}kg</span>}
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-3">
            <button onClick={() => setAddModal(true)} 
              className="w-full py-3 bg-violet-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-violet-500 transition-colors">
              <Plus size={18} /> Add Workout
            </button>
            
            {['Push', 'Pull', 'Legs'].map(day => {
              const dayWorkouts = [...history].filter(h => h.day === day).reverse();
              const grouped = {};
              dayWorkouts.forEach(w => {
                if (!grouped[w.date]) grouped[w.date] = [];
                grouped[w.date].push(w);
              });
              
              return (
                <div key={day} className="bg-zinc-900 rounded-2xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${day === 'Push' ? 'bg-red-500' : day === 'Pull' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                    {day} Day
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {Object.entries(grouped).slice(0, 5).map(([date, workouts]) => (
                      <div key={date} className="bg-zinc-800 rounded-xl p-3">
                        <div className="text-xs text-zinc-500 mb-2">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        {workouts.map((w) => (
                          <div key={w.id} className="flex justify-between items-center text-sm py-1.5 group">
                            <div className="flex-1 min-w-0">
                              <span className="text-zinc-300">{w.exercise}</span>
                              {w.notes && <span className="text-xs text-yellow-500 ml-2">[{w.notes}]</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500">
                                {w.sets.map((s, j) => <span key={j}>{s.r}{j < w.sets.length - 1 ? ',' : ''}</span>)}
                                {w.sets[0]?.w > 0 && <span className="text-violet-400 ml-1">@{w.sets[0].w}kg</span>}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditModal({...w, notes: w.notes || ''})} className="p-1 hover:bg-zinc-700 rounded">
                                  <Pencil size={14} className="text-zinc-400" />
                                </button>
                                <button onClick={() => deleteWorkout(w.id)} className="p-1 hover:bg-zinc-700 rounded">
                                  <Trash2 size={14} className="text-red-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-2xl p-5 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Edit Workout</h3>
              <button onClick={() => setEditModal(null)} className="p-1 hover:bg-zinc-800 rounded"><X size={20} /></button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Date</label>
                <input type="date" value={editModal.date} onChange={e => setEditModal({...editModal, date: e.target.value})}
                  className="w-full bg-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Day</label>
                <select value={editModal.day} onChange={e => setEditModal({...editModal, day: e.target.value})}
                  className="w-full bg-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none">
                  {['Push', 'Pull', 'Legs'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Exercise</label>
                <select value={editModal.exercise} onChange={e => setEditModal({...editModal, exercise: e.target.value})}
                  className="w-full bg-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none">
                  {allExercises.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Sets (Reps @ Weight kg)</label>
                <div className="space-y-2">
                  {editModal.sets.map((set, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-zinc-500 text-xs w-6">#{i+1}</span>
                      <input type="number" value={set.r} onChange={e => updateEditSet(i, 'r', e.target.value)}
                        placeholder="Reps" className="flex-1 bg-zinc-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      <span className="text-zinc-500">@</span>
                      <input type="number" step="0.5" value={set.w} onChange={e => updateEditSet(i, 'w', e.target.value)}
                        placeholder="kg" className="flex-1 bg-zinc-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      <button onClick={() => removeEditSet(i)} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addEditSet} className="mt-2 text-xs text-violet-400 hover:text-violet-300">+ Add Set</button>
              </div>
              
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Notes (optional)</label>
                <input value={editModal.notes || ''} onChange={e => setEditModal({...editModal, notes: e.target.value})}
                  placeholder="e.g. felt heavy, cheated last rep, smooth..."
                  className="w-full bg-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            </div>
            
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 bg-zinc-800 rounded-xl text-sm hover:bg-zinc-700">Cancel</button>
              <button onClick={saveEdit} className="flex-1 py-2.5 bg-violet-600 rounded-xl text-sm font-medium hover:bg-violet-500 flex items-center justify-center gap-1">
                <Check size={16} /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-2xl p-5 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Add Workout</h3>
              <button onClick={() => setAddModal(false)} className="p-1 hover:bg-zinc-800 rounded"><X size={20} /></button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Date</label>
                <input type="date" value={newWorkout.date} onChange={e => setNewWorkout({...newWorkout, date: e.target.value})}
                  className="w-full bg-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Day</label>
                <select value={newWorkout.day} onChange={e => setNewWorkout({...newWorkout, day: e.target.value})}
                  className="w-full bg-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none">
                  {['Push', 'Pull', 'Legs'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Exercise</label>
                <select value={newWorkout.exercise} onChange={e => setNewWorkout({...newWorkout, exercise: e.target.value})}
                  className="w-full bg-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none">
                  <option value="">Select exercise...</option>
                  {exercises[newWorkout.day].map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Sets (Reps @ Weight kg)</label>
                <div className="space-y-2">
                  {newWorkout.sets.map((set, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-zinc-500 text-xs w-6">#{i+1}</span>
                      <input type="number" value={set.r} onChange={e => {
                        const n = [...newWorkout.sets]; n[i] = {...n[i], r: e.target.value}; setNewWorkout({...newWorkout, sets: n});
                      }} placeholder="Reps" className="flex-1 bg-zinc-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      <span className="text-zinc-500">@</span>
                      <input type="number" step="0.5" value={set.w} onChange={e => {
                        const n = [...newWorkout.sets]; n[i] = {...n[i], w: e.target.value}; setNewWorkout({...newWorkout, sets: n});
                      }} placeholder="kg" className="flex-1 bg-zinc-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      {newWorkout.sets.length > 1 && (
                        <button onClick={() => setNewWorkout({...newWorkout, sets: newWorkout.sets.filter((_, idx) => idx !== i)})} 
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={() => setNewWorkout({...newWorkout, sets: [...newWorkout.sets, {r:'', w: newWorkout.sets[0]?.w || ''}]})} 
                  className="mt-2 text-xs text-violet-400 hover:text-violet-300">+ Add Set</button>
              </div>
              
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Notes (optional)</label>
                <input value={newWorkout.notes} onChange={e => setNewWorkout({...newWorkout, notes: e.target.value})}
                  placeholder="e.g. felt heavy, cheated last rep, smooth..."
                  className="w-full bg-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            </div>
            
            <div className="flex gap-2 mt-5">
              <button onClick={() => setAddModal(false)} className="flex-1 py-2.5 bg-zinc-800 rounded-xl text-sm hover:bg-zinc-700">Cancel</button>
              <button onClick={addWorkout} className="flex-1 py-2.5 bg-violet-600 rounded-xl text-sm font-medium hover:bg-violet-500 flex items-center justify-center gap-1">
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Library Modal */}
      {exerciseModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-2xl p-5 w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Exercise Library</h3>
              <button onClick={() => setExerciseModal(false)} className="p-1 hover:bg-zinc-800 rounded"><X size={20} /></button>
            </div>
            
            {/* Add new exercise */}
            <div className="bg-zinc-800 rounded-xl p-3 mb-4">
              <div className="text-xs text-zinc-500 mb-2">Add New Exercise</div>
              <div className="flex gap-2">
                <input value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                  placeholder="Exercise name" className="flex-1 bg-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <select value={newExercise.day} onChange={e => setNewExercise({...newExercise, day: e.target.value})}
                  className="bg-zinc-700 rounded-lg p-2 text-sm focus:outline-none">
                  {['Push', 'Pull', 'Legs'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="number" value={newExercise.defaultReps} onChange={e => setNewExercise({...newExercise, defaultReps: e.target.value})}
                  placeholder="Reps" className="w-16 bg-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <button onClick={addExercise} className="p-2 bg-violet-600 rounded-lg hover:bg-violet-500">
                  <Plus size={18} />
                </button>
              </div>
            </div>
            
            {/* Exercise list by day */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {['Push', 'Pull', 'Legs'].map(day => (
                <div key={day}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${day === 'Push' ? 'bg-red-500' : day === 'Pull' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                    <span className="text-sm font-medium">{day}</span>
                    <span className="text-xs text-zinc-500">({exercises[day].length})</span>
                  </div>
                  <div className="space-y-1">
                    {exercises[day].map(ex => (
                      <div key={ex.id} className="flex items-center justify-between bg-zinc-800 rounded-lg p-2.5 group">
                        {editExercise?.id === ex.id ? (
                          <div className="flex-1 flex gap-2 items-center">
                            <input value={editExercise.name} onChange={e => setEditExercise({...editExercise, name: e.target.value})}
                              className="flex-1 bg-zinc-700 rounded p-1.5 text-sm focus:outline-none" />
                            <select value={editExercise.day} onChange={e => setEditExercise({...editExercise, day: e.target.value})}
                              className="bg-zinc-700 rounded p-1.5 text-sm focus:outline-none">
                              {['Push', 'Pull', 'Legs'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <input type="number" value={editExercise.defaultReps} onChange={e => setEditExercise({...editExercise, defaultReps: e.target.value})}
                              className="w-14 bg-zinc-700 rounded p-1.5 text-sm focus:outline-none" />
                            <button onClick={saveExerciseEdit} className="p-1 text-green-400 hover:bg-zinc-700 rounded"><Check size={16} /></button>
                            <button onClick={() => setEditExercise(null)} className="p-1 text-zinc-400 hover:bg-zinc-700 rounded"><X size={16} /></button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <span className="text-sm">{ex.name}</span>
                              <span className="text-xs text-zinc-500 ml-2">{ex.defaultReps} reps</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditExercise({ ...ex, day })} className="p-1 hover:bg-zinc-700 rounded">
                                <Pencil size={14} className="text-zinc-400" />
                              </button>
                              <button onClick={() => deleteExercise(day, ex.id)} className="p-1 hover:bg-zinc-700 rounded">
                                <Trash2 size={14} className="text-red-400" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex gap-2">
                <button onClick={exportData} className="flex-1 py-2.5 bg-zinc-800 rounded-xl text-sm hover:bg-zinc-700 flex items-center justify-center gap-2">
                  <Download size={16} /> Export Backup
                </button>
                <label className="flex-1 py-2.5 bg-zinc-800 rounded-xl text-sm hover:bg-zinc-700 flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={16} /> Import Backup
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={clearAllData} className="flex-1 py-2.5 bg-red-950 text-red-400 rounded-xl text-sm hover:bg-red-900">
                  Clear All Data
                </button>
                <button onClick={() => setExerciseModal(false)} className="flex-1 py-2.5 bg-violet-600 rounded-xl text-sm hover:bg-violet-500">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
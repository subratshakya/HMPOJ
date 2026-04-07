import React, { useState, useEffect, useRef } from "react";
import Header from "../components/header";
import Footer from "../components/footer";

/* ─────────────────────────────────────────────
   Data definitions
───────────────────────────────────────────── */

const NAV_SECTIONS = [
  { id: "overview", label: "System Overview" },
  { id: "features", label: "Features" },
  { id: "stack", label: "Tech Stack" },
  { id: "hld", label: "High-Level Design" },
  { id: "database", label: "Database Design" },
  { id: "flows", label: "System Flows" },
  { id: "deepdives", label: "Deep Dives" },
  { id: "future", label: "Future Enhancements" },
  { id: "demo", label: "System Demo" },
  { id: "contact", label: "Contact Developer" },
];

const TECH_STACK = [
  {
    name: "React + Tailwind",
    role: "Frontend",
    why: "Fast, reactive UI with utility-first styling and a best-in-class developer experience.",
    icon: "⚛️",
    color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/30",
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  },
  {
    name: "Node.js + Express",
    role: "Backend Core",
    why: "Non-blocking I/O handles hundreds of simultaneous connections without spawning expensive threads.",
    icon: "🟢",
    color: "from-green-500/10 to-emerald-500/10 border-green-500/30",
    badge: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
  {
    name: "MongoDB",
    role: "Primary Database",
    why: "Flexible document schema accommodates polymorphic problem types and complex nested submission data naturally.",
    icon: "🍃",
    color: "from-green-600/10 to-lime-500/10 border-green-600/30",
    badge: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
  },
  {
    name: "RabbitMQ",
    role: "Message Broker",
    why: "Decouples code submission from execution. Even under peak load, no job is dropped from the queue.",
    icon: "🐇",
    color: "from-orange-500/10 to-amber-500/10 border-orange-500/30",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  },
  {
    name: "Redis",
    role: "High-Speed Cache",
    why: "Sub-millisecond leaderboard reads and real-time chat presence tracking with minimal MongoDB load.",
    icon: "⚡",
    color: "from-red-500/10 to-rose-500/10 border-red-500/30",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  },
  {
    name: "Socket.io",
    role: "Real-Time Sync",
    why: "Pushes submission verdicts and chat messages to clients instantly—no polling required.",
    icon: "🔌",
    color: "from-purple-500/10 to-violet-500/10 border-purple-500/30",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  },
  {
    name: "Judge0 API",
    role: "Execution Engine",
    why: "Sandboxed, network-isolated container runtime. Currently wired for C++, Java, Python and Node.js — the API itself supports 60+ languages for future expansion.",
    icon: "⚖️",
    color: "from-yellow-500/10 to-amber-500/10 border-yellow-500/30",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  {
    name: "Docker",
    role: "Containerization",
    why: "One-command local environment spinning up MongoDB, Redis, and RabbitMQ consistently across machines.",
    icon: "🐳",
    color: "from-blue-500/10 to-sky-500/10 border-blue-500/30",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
];

const FEATURES = [
  { icon: "🚀", title: "Async Code Execution", desc: "Submissions are enqueued via RabbitMQ and judged by a background worker, preventing any API timeout." },
  { icon: "🏆", title: "Live Leaderboard", desc: "Redis-cached global rankings updated in real-time as verdicts are processed." },
  { icon: "⚔️", title: "Codeforces-Style Contests", desc: "Timed coding arenas with real-time score decay based on elapsed minutes and wrong-answer penalties." },
  { icon: "💬", title: "Real-Time Chat", desc: "Socket.io powered community chat rooms for discussing problems while you code." },
  { icon: "🔐", title: "Secure Auth & RBAC", desc: "JWT in httpOnly cookies + Google OAuth 2.0 with Admin / User role separation." },
  { icon: "📝", title: "Blog Platform", desc: "Full blog system for editorial write-ups and community posts." },
  { icon: "🌍", title: "4 Language Support", desc: "C++, Java, Python, and Node.js — with infrastructure in place to expand to 60+ more Judge0-supported languages." },
  { icon: "🛡️", title: "Sandboxed Execution", desc: "User code runs in an isolated container with zero network access and hard resource caps." },
  { icon: "📊", title: "User Analytics", desc: "Per-user dashboard tracking problems solved, points earned, and submission history." },
];

const FLOWS = [
  {
    title: "Submission Lifecycle",
    subtitle: "The core async judging pipeline",
    steps: [
      { num: "01", label: "User submits code", detail: "React UI sends source code + language to the REST API." },
      { num: "02", label: "Enqueue to RabbitMQ", detail: "Express validates the JWT, creates a 'Pending' record in MongoDB, and pushes a job to SUBMISSION_QUEUE." },
      { num: "03", label: "202 Accepted", detail: "The API immediately returns 202—the user sees a live spinner, not a timeout." },
      { num: "04", label: "Worker picks up job", detail: "The background Node.js worker consumes the message at its own pace (prefetch: 1)." },
      { num: "05", label: "Judge0 execution", detail: "Worker batches all test cases and sends them to Judge0's sandboxed runtime." },
      { num: "06", label: "Verdict resolution", detail: "All test-case statuses are reduced to Accepted / Wrong Answer / Runtime Error." },
      { num: "07", label: "DB update + points", detail: "Submission record is saved. Accepted → questions solved++ & points earned. Wrong → –5 pts." },
      { num: "08", label: "Socket.io push", detail: "The verdict is broadcast to the user's browser room, updating the UI without a page reload." },
    ],
  },
  {
    title: "Leaderboard Cache Flow",
    subtitle: "Redis-first read strategy",
    steps: [
      { num: "01", label: "User opens Leaderboard", detail: "React component fires a GET /api/leaderboard request." },
      { num: "02", label: "Redis cache check", detail: "Server checks for a pre-computed ranking key in Redis." },
      { num: "03", label: "Cache Hit (< 1ms)", detail: "Ranking returned directly from memory—MongoDB never touched." },
      { num: "04", label: "Cache Miss fallback", detail: "MongoDB aggregation sorts users by pointsEarned descending." },
      { num: "05", label: "Hydrate cache", detail: "Result written to Redis with a short TTL so rankings stay near-realtime." },
      { num: "06", label: "Return to client", detail: "Fresh ranking returned; next request will be a cache hit." },
    ],
  },
];

const DEEP_DIVES = [
  {
    icon: "🐇",
    title: "Event-Driven Decoupling with RabbitMQ",
    content:
      "Without a message queue, a burst of 500 simultaneous submissions would all hit Judge0 at once, causing timeouts and cascading failures. RabbitMQ acts as an elastic buffer—the API writes at full speed, the worker reads at a safe pace (prefetch: 1). Even if the worker crashes, messages persist in the durable queue and are reprocessed on restart. Poison messages are dead-lettered (nack, no requeue) to avoid infinite retry loops.",
    code: `channel.prefetch(1); // process only 1 job at a time
channel.consume(SUBMISSION_QUEUE, async (msg) => {
  // ... judge, save, notify
  channel.ack(msg);   // only ack on success
}, { noAck: false }); // manual acknowledgement`,
  },
  {
    icon: "🛡️",
    title: "Zero-Trust Identity — Never Trust the Client",
    content:
      "The submission endpoint accepts only source code and language from the client body. The userId is extracted exclusively from the decoded JWT at the API boundary. This prevents a malicious user from submitting as another user, earning points on their behalf, or poisoning the leaderboard with forged identities — even if they intercept and replay API requests.",
    code: `// Middleware extracts identity from JWT – never from body
const { userId } = req.user; // set by isAuthenticated middleware

await User.findByIdAndUpdate(userId, {
  $inc: { pointsEarned: pointsToAdd },
  $addToSet: { solvedProblems: problemId }
});`,
  },
  {
    icon: "⚡",
    title: "Redis Caching Strategy",
    content:
      "The leaderboard is a MongoDB aggregation over the entire users collection — expensive to run on every page load. Redis stores the result with a configurable TTL. The cache is invalidated proactively when a submission is accepted, not on a fixed timer, ensuring rankings are always fresh within one submission cycle rather than sitting stale for minutes.",
    code: `const cached = await redisClient.get('leaderboard');
if (cached) return res.json(JSON.parse(cached));

const data = await User.find().sort({ pointsEarned: -1 });
await redisClient.setEx('leaderboard', 30, JSON.stringify(data));
res.json(data);`,
  },
  {
    icon: "🔌",
    title: "Real-Time Socket.io Architecture",
    content:
      "When a user submits code, they join a socket room keyed by their userId. The background worker, once it resolves a verdict, emits a submissionResult event to that room. The React client listens for this event and updates the UI atomically — showing verdict, time, and memory — without any polling loop or page refresh.",
    code: `// Server: worker emits after verdict
io.to(userId).emit('submissionResult', {
  status: finalStatus,
  jobId: job.jobId
});

// Client: listener in SubmitPage.js  
socket.on('submissionResult', ({ status }) => {
  setVerdict(status);
});`,
  },
  {
    icon: "⚔️",
    title: "Time-Decay Scoring Engine",
    content:
      "When evaluating Contest Leaderboards, scores aren't static. A real-time aggregation pipeline maps submissions to the active contest, calculates the 'minutesElapsed' since the contest start, applies a decay algorithm to the problem's base points, and forcefully subtracts 50 points for every prior Wrong Answer attempt until an Accepted verdict is finally reached.",
    code: `// Dynamic point calculation on-the-fly
const minutesElapsed = Math.floor((submitTime - startTime) / 60000);
const rawDecay = Math.floor(basePoints * ((250 - minutesElapsed) / 250));
const finalPoints = Math.max(rawDecay, basePoints * 0.3);
const penalty = Math.max(0, attempts - 1) * 50;

userTotalPoints += Math.max(finalPoints - penalty, 0);`,
  },
];

const FUTURE = [
  { color: "bg-yellow-400", label: "Planned", title: "Custom Docker Judge", desc: "Self-hosted Judge0 replacement for lower latency and full resource control." },
  { color: "bg-yellow-400", label: "Planned", title: "Plagiarism Detection", desc: "MOSS integration to flag suspiciously similar code across submissions." },
  { color: "bg-green-400", label: "In Progress", title: "Redis RedLock", desc: "Distributed locking to safely handle concurrent contest registrations." },
  { color: "bg-gray-400", label: "Backlog", title: "Centralized Logging", desc: "Structured JSON logs with correlation IDs funnelled into a log viewer." },
  { color: "bg-gray-400", label: "Backlog", title: "Circuit Breaker", desc: "Resilience4j-style fallback to gracefully degrade when Judge0 is unavailable." },
];

/* ─────────────────────────────────────────────
   Helper: animated counter
───────────────────────────────────────────── */
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

function StatCard({ value, suffix, label }) {
  const count = useCountUp(value);
  return (
    <div className="text-center">
      <p className="font-mono text-4xl font-bold text-gray-900 dark:text-white">
        {count}{suffix}
      </p>
      <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function SectionTitle({ label, title, subtitle }) {
  return (
    <div className="mb-10">
      <span className="inline-block font-mono text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-2">
        {label}
      </span>
      <h2 className="font-mono text-3xl font-bold text-gray-900 dark:text-white leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="font-mono text-base text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function HLDDiagram() {
  const nodes = [
    { id: "user", label: "User / Browser", x: 50, y: 30, w: 140 },
    { id: "react", label: "React Frontend", x: 220, y: 30, w: 140 },
    { id: "api", label: "Express API", x: 400, y: 30, w: 130 },
    { id: "mq", label: "RabbitMQ Queue", x: 570, y: 30, w: 150 },
    { id: "worker", label: "Node.js Worker", x: 570, y: 130, w: 150 },
    { id: "judge", label: "Judge0 API", x: 570, y: 230, w: 130 },
    { id: "mongo", label: "MongoDB", x: 220, y: 230, w: 120 },
    { id: "redis", label: "Redis Cache", x: 400, y: 230, w: 120 },
    { id: "socket", label: "Socket.io", x: 400, y: 130, w: 120 },
  ];

  const edges = [
    { from: [190, 47], to: [220, 47], label: "HTTP" },
    { from: [360, 47], to: [400, 47], label: "REST" },
    { from: [530, 47], to: [570, 47], label: "Enqueue" },
    { from: [645, 80], to: [645, 130], label: "Consume" },
    { from: [645, 180], to: [645, 230], label: "Execute" },
    { from: [570, 247], to: [340, 247], label: "Save" },
    { from: [400, 247], to: [400, 180], label: "Cache" },
    { from: [400, 130], to: [360, 47], label: "Push", dashed: true },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
      <svg viewBox="0 0 760 310" className="w-full font-mono" style={{ minWidth: 600 }}>
        {/* edges */}
        {edges.map((e, i) => (
          <g key={i}>
            <line
              x1={e.from[0]} y1={e.from[1]} x2={e.to[0]} y2={e.to[1]}
              stroke="#6b7280" strokeWidth="1.5"
              strokeDasharray={e.dashed ? "5,3" : "none"}
              markerEnd="url(#arrow)"
            />
            <text x={(e.from[0] + e.to[0]) / 2} y={(e.from[1] + e.to[1]) / 2 - 4}
              fontSize="9" fill="#9ca3af" textAnchor="middle">{e.label}</text>
          </g>
        ))}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#6b7280" />
          </marker>
        </defs>
        {/* nodes */}
        {nodes.map((n) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y - 18} width={n.w} height={34}
              rx="6" fill="white" stroke="#d1d5db" strokeWidth="1.5"
              className="dark:fill-gray-800 dark:stroke-gray-600" />
            <text x={n.x + n.w / 2} y={n.y + 5} textAnchor="middle"
              fontSize="11" fill="#111827" className="dark:fill-gray-200">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Diagram: Submission State Machine
───────────────────────────────────────────── */
function StateMachineDiagram() {
  const W = 130; const H = 36; const R = 6;
  const states = [
    { id: "pending", label: "Pending", x: 18, y: 87, fill: "#f3f4f6", stroke: "#9ca3af", text: "#374151" },
    { id: "queued", label: "Queued", x: 198, y: 87, fill: "#dbeafe", stroke: "#93c5fd", text: "#1e40af" },
    { id: "exec", label: "Executing", x: 378, y: 87, fill: "#fef3c7", stroke: "#fcd34d", text: "#92400e" },
    { id: "accepted", label: "✓  Accepted", x: 558, y: 20, fill: "#d1fae5", stroke: "#6ee7b7", text: "#065f46" },
    { id: "wrong", label: "Wrong Answer", x: 558, y: 87, fill: "#fee2e2", stroke: "#fca5a5", text: "#991b1b" },
    { id: "runtime", label: "Runtime Error", x: 558, y: 154, fill: "#ffedd5", stroke: "#fdba74", text: "#9a3412" },
  ];
  const arrow = "url(#sm-tip)";
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
      <svg viewBox="0 0 720 210" className="w-full" style={{ minWidth: 520 }}>
        <defs>
          <marker id="sm-tip" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#6b7280" />
          </marker>
        </defs>
        {/* start dot */}
        <circle cx="8" cy="105" r="6" fill="#111827" />
        {/* straight edges */}
        <line x1="14" y1="105" x2="18" y2="105" stroke="#6b7280" strokeWidth="1.5" markerEnd={arrow} />
        <line x1="148" y1="105" x2="198" y2="105" stroke="#6b7280" strokeWidth="1.5" markerEnd={arrow} />
        <line x1="328" y1="105" x2="378" y2="105" stroke="#6b7280" strokeWidth="1.5" markerEnd={arrow} />
        {/* branch edges from Executing right (508,105) */}
        <line x1="508" y1="101" x2="558" y2="38" stroke="#059669" strokeWidth="1.5" markerEnd={arrow} />
        <line x1="508" y1="105" x2="558" y2="105" stroke="#ef4444" strokeWidth="1.5" markerEnd={arrow} />
        <line x1="508" y1="109" x2="558" y2="172" stroke="#f97316" strokeWidth="1.5" markerEnd={arrow} />
        {/* edge labels */}
        <text x="168" y="100" textAnchor="middle" fontSize="8" fill="#9ca3af">enqueue</text>
        <text x="352" y="100" textAnchor="middle" fontSize="8" fill="#9ca3af">pick up</text>
        <text x="526" y="72" textAnchor="middle" fontSize="8" fill="#059669">all pass</text>
        <text x="526" y="98" textAnchor="middle" fontSize="8" fill="#ef4444">fail</text>
        <text x="526" y="130" textAnchor="middle" fontSize="8" fill="#f97316">crash/TLE</text>
        {/* state nodes */}
        {states.map((s) => (
          <g key={s.id}>
            <rect x={s.x} y={s.y} width={W} height={H} rx={R} fill={s.fill} stroke={s.stroke} strokeWidth="1.5" />
            <text x={s.x + W / 2} y={s.y + H / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill={s.text}>{s.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Diagram: Database Schema (ERD)
───────────────────────────────────────────── */
function DatabaseSchemaDiagram() {
  const ROW = 16; const HDR = 26; const PAD = 6; const BW = 195;
  const mkBox = (name, fields, x, y, hdr, light) => {
    const h = HDR + fields.length * ROW + PAD;
    return { name, fields, x, y, w: BW, h, hdr, light };
  };
  const boxes = [
    mkBox("User", [
      { f: "_id", t: "ObjectId", pk: true },
      { f: "userName", t: "String" },
      { f: "email", t: "String" },
      { f: "role", t: "String" },
      { f: "pointsEarned", t: "Number" },
      { f: "questionsSolved", t: "Number" },
      { f: "solvedProblems", t: "ObjectId[ ]" },
    ], 20, 20, "#1d4ed8", "#dbeafe"),
    mkBox("Problem", [
      { f: "_id", t: "ObjectId", pk: true },
      { f: "title", t: "String" },
      { f: "difficulty", t: "String" },
      { f: "timeLimit", t: "Number" },
      { f: "testcases", t: "ObjectId[ ]" },
    ], 495, 20, "#065f46", "#d1fae5"),
    mkBox("Submission", [
      { f: "_id", t: "ObjectId", pk: true },
      { f: "user", t: "→ User", fk: true },
      { f: "problem", t: "→ Problem", fk: true },
      { f: "code", t: "String" },
      { f: "language", t: "Number" },
      { f: "status", t: "String" },
    ], 258, 240, "#92400e", "#fef3c7"),
    mkBox("Contest", [
      { f: "_id", t: "ObjectId", pk: true },
      { f: "title", t: "String" },
      { f: "startTime", t: "Date" },
      { f: "endTime", t: "Date" },
      { f: "problems", t: "Obj[prob, pts]" },
      { f: "participants", t: "ObjectId[ ]" },
    ], 495, 200, "#7c3aed", "#ede9fe"),
    mkBox("Blog", [
      { f: "_id", t: "ObjectId", pk: true },
      { f: "author", t: "→ User", fk: true },
      { f: "title", t: "String" },
      { f: "content", t: "String" },
      { f: "createdAt", t: "Date" },
    ], 20, 250, "#9d174d", "#fce7f3"),
  ];

  // route lines: [x1,y1, x2,y2 via waypoints]
  // Submission.user → User center-right
  const userCY = boxes[0].y + boxes[0].h / 2;  // ~93
  const probCY = boxes[1].y + boxes[1].h / 2;  // ~73
  const subCY = boxes[2].y + boxes[2].h / 2;  // ~305
  const blogCY = boxes[3].y + boxes[3].h / 2;  // ~303

  const routes = [
    { pts: [[258, subCY], [230, subCY], [230, userCY], [215, userCY]], color: "#3b82f6", label: "user", lx: 232, ly: subCY - 4 },
    { pts: [[453, subCY], [475, subCY], [475, probCY], [495, probCY]], color: "#10b981", label: "problem", lx: 472, ly: subCY - 4 },
    { pts: [[20, blogCY], [4, blogCY], [4, userCY], [20, userCY]], color: "#ec4899", label: "author", lx: 6, ly: (blogCY + userCY) / 2 },
  ];

  const arrowTip = "url(#erd-tip)";

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
      <svg viewBox="0 0 710 390" className="w-full" style={{ minWidth: 560 }}>
        <defs>
          <marker id="erd-tip" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#6b7280" />
          </marker>
        </defs>

        {/* relation routes */}
        {routes.map((r, ri) => (
          <g key={ri}>
            <polyline
              points={r.pts.map(p => p.join(",")).join(" ")}
              fill="none" stroke={r.color} strokeWidth="1.5"
              strokeDasharray="5,3" markerEnd={arrowTip}
            />
            <text x={r.lx} y={r.ly} fontSize="8" fill={r.color} fontWeight="700">{r.label}</text>
          </g>
        ))}

        {/* collection boxes */}
        {boxes.map((b) => (
          <g key={b.name}>
            {/* header */}
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="7" fill={b.light} stroke={b.hdr} strokeWidth="1.5" />
            <rect x={b.x} y={b.y} width={b.w} height={HDR} rx="7" fill={b.hdr} />
            <rect x={b.x} y={b.y + HDR - 4} width={b.w} height={4} fill={b.hdr} />
            <text x={b.x + b.w / 2} y={b.y + HDR - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill="white">{b.name}</text>
            {/* fields */}
            {b.fields.map((field, fi) => (
              <g key={fi}>
                <text
                  x={b.x + 10} y={b.y + HDR + fi * ROW + ROW - 2}
                  fontSize="10"
                  fill={field.pk ? "#1d4ed8" : field.fk ? "#7c3aed" : "#374151"}
                  fontWeight={field.pk || field.fk ? "700" : "400"}
                >
                  {field.pk ? "🔑 " : field.fk ? "🔗 " : "   "}{field.f}
                </text>
                <text
                  x={b.x + b.w - 8} y={b.y + HDR + fi * ROW + ROW - 2}
                  fontSize="9" fill="#9ca3af" textAnchor="end"
                >
                  {field.t}
                </text>
              </g>
            ))}
          </g>
        ))}
      </svg>
      <div className="flex gap-4 mt-3 font-mono text-xs text-gray-400 dark:text-gray-600">
        <span className="flex items-center gap-1">🔑 Primary Key</span>
        <span className="flex items-center gap-1">🔗 Foreign Reference</span>
        <span className="flex items-center gap-1">╌╌ Reference relation</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Diagram: Authentication Flow
───────────────────────────────────────────── */
function AuthFlowDiagram() {
  const actors = [
    { label: "Browser / Client", x: 110 },
    { label: "Express API", x: 355 },
    { label: "MongoDB", x: 600 },
  ];
  const arrow = "url(#af-tip)";
  const arrowL = "url(#af-tip-l)";
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
      <svg viewBox="0 0 710 345" className="w-full" style={{ minWidth: 560 }}>
        <defs>
          <marker id="af-tip" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6b7280" /></marker>
          <marker id="af-tip-l" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="#6b7280" /></marker>
        </defs>

        {/* Actor headers */}
        {actors.map((a) => (
          <g key={a.label}>
            <rect x={a.x - 68} y={10} width={136} height={26} rx="5" fill="#111827" />
            <text x={a.x} y={28} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">{a.label}</text>
          </g>
        ))}

        {/* Phase 1 lifelines */}
        {actors.map((a) => <line key={a.x} x1={a.x} y1={36} x2={a.x} y2={198} stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,3" />)}

        {/* Phase 1 Label */}
        <text x={12} y={60} fontSize="8" fill="#9ca3af" fontWeight="700">PHASE 1 — LOGIN</text>

        {/* POST /login */}
        <line x1={110} y1={72} x2={348} y2={72} stroke="#6b7280" strokeWidth="1.5" markerEnd={arrow} />
        <text x={228} y={68} textAnchor="middle" fontSize="9" fill="#374151">POST /api/login  {"{ email, password }"}</text>

        {/* findUser */}
        <line x1={355} y1={97} x2={593} y2={97} stroke="#6b7280" strokeWidth="1.5" markerEnd={arrow} />
        <text x={474} y={93} textAnchor="middle" fontSize="9" fill="#374151">User.findOne(email)</text>

        {/* user doc back */}
        <line x1={600} y1={122} x2={362} y2={122} stroke="#6b7280" strokeWidth="1.5" markerEnd={arrowL} />
        <text x={474} y={118} textAnchor="middle" fontSize="9" fill="#374151">user document</text>

        {/* Sign JWT self-note */}
        <rect x={308} y={133} width={94} height={19} rx="3" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
        <text x={355} y={146} textAnchor="middle" fontSize="8" fill="#92400e">bcrypt verify + sign JWT</text>

        {/* 200 + Set-Cookie */}
        <line x1={355} y1={164} x2={117} y2={164} stroke="#059669" strokeWidth="1.5" markerEnd={arrowL} />
        <text x={228} y={160} textAnchor="middle" fontSize="9" fill="#059669">200 OK  Set-Cookie: token (httpOnly)</text>

        {/* Divider */}
        <line x1={10} y1={198} x2={700} y2={198} stroke="#e5e7eb" strokeWidth="1" />

        {/* Phase 2 lifelines */}
        {[110, 355].map((x) => <line key={x} x1={x} y1={198} x2={x} y2={340} stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,3" />)}

        {/* Phase 2 Label */}
        <text x={12} y={218} fontSize="8" fill="#9ca3af" fontWeight="700">PHASE 2 — PROTECTED REQUEST</text>

        {/* GET + Cookie */}
        <line x1={110} y1={230} x2={348} y2={230} stroke="#6b7280" strokeWidth="1.5" markerEnd={arrow} />
        <text x={228} y={226} textAnchor="middle" fontSize="9" fill="#374151">GET /api/...  + Cookie header</text>

        {/* Middleware boxes */}
        <rect x={285} y={242} width={140} height={19} rx="3" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1" />
        <text x={355} y={256} textAnchor="middle" fontSize="8" fill="#5b21b6">isAuthenticated middleware</text>

        <rect x={285} y={267} width={140} height={19} rx="3" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1" />
        <text x={355} y={281} textAnchor="middle" fontSize="8" fill="#5b21b6">Extract + verify JWT</text>

        <rect x={285} y={292} width={140} height={19} rx="3" fill="#d1fae5" stroke="#059669" strokeWidth="1" />
        <text x={355} y={306} textAnchor="middle" fontSize="8" fill="#065f46">Inject userId into req.user</text>

        {/* Forward to controller */}
        <line x1={425} y1={320} x2="514" y2={320} stroke="#059669" strokeWidth="1.5" markerEnd={arrow} />
        <text x={468} y={316} textAnchor="middle" fontSize="9" fill="#059669">route handler</text>
        <rect x={516} y={309} width={110} height={22} rx="5" fill="#111827" />
        <text x={571} y={324} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">Controller</text>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
const EngineeringPage = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedDive, setExpandedDive] = useState(null);
  const [activeFlow, setActiveFlow] = useState(0);

  // Scrollspy
  useEffect(() => {
    const handleScroll = () => {
      const offsets = NAV_SECTIONS.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? { id, top: el.getBoundingClientRect().top } : null;
      }).filter(Boolean);
      const active = offsets.filter((o) => o.top <= 120).at(-1);
      if (active) setActiveSection(active.id);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #111 2px, transparent 0), radial-gradient(circle at 75px 75px, #111 2px, transparent 0)",
            backgroundSize: "100px 100px",
          }}
        />
        <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-4">
            Engineering Overview
          </span>
          <h1 className="font-mono text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight max-w-3xl">
            HMP OJ<span className="text-gray-400 dark:text-gray-600"> —</span> Under the Hood
          </h1>
          <p className="font-mono text-lg text-gray-500 dark:text-gray-400 mt-6 max-w-2xl leading-relaxed">
            A deep dive into the event-driven architecture, asynchronous judging pipeline,
            real-time infrastructure, and engineering decisions that power a production-grade
            Online Judge.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            {["React", "Node.js", "MongoDB", "RabbitMQ", "Redis", "Judge0", "Socket.io", "Docker"].map((t) => (
              <span key={t}
                className="font-mono text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                {t}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-100 dark:border-gray-800 pt-10">
            <StatCard value={6} suffix="" label="Stack components" />
            <StatCard value={4} suffix="" label="Languages supported" />
            <StatCard value={500} suffix="+" label="Submissions / day" />
            <StatCard value={70} suffix="%" label="API latency reduced" />
          </div>
        </div>
      </section>

      {/* ── Sticky sidebar layout ── */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">

          {/* Sidebar nav */}
          <aside className="hidden lg:block">
            <nav className="sticky top-20">
              <p className="font-mono text-xs tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-4">
                On this page
              </p>
              <ul className="space-y-1">
                {NAV_SECTIONS.map(({ id, label }) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollTo(id)}
                      className={`font-mono text-sm w-full text-left px-3 py-1.5 rounded-md transition-all
                        ${activeSection === id
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <main className="space-y-24">

            {/* ── System Overview ── */}
            <section id="overview">
              <SectionTitle
                label="01 / System Overview"
                title="What is HMP OJ?"
                subtitle="Not just a LeetCode clone — a production-inspired, event-driven competitive programming engine."
              />
              <div className="font-mono text-base text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">
                <p>
                  <strong className="text-gray-900 dark:text-white">HMP OJ</strong> is a full-scale
                  online judge platform engineered for high-concurrency code execution. The central
                  design challenge is straightforward: running user-submitted code is slow, risky,
                  and resource-intensive — it cannot live in the same synchronous request cycle as the
                  REST API.
                </p>
                <p>
                  The solution is a classic <strong className="text-gray-900 dark:text-white">producer-consumer
                    architecture</strong> powered by RabbitMQ. When a user submits code, the API
                  acknowledges the request immediately and enqueues a job. A separate worker process
                  consumes jobs at its own pace, calls Judge0's sandboxed runtime, resolves the verdict,
                  and pushes the result back to the browser via Socket.io — all outside the HTTP
                  request lifecycle.
                </p>
                <p>
                  This design enables the system to handle bursts of submissions without timeouts,
                  to scale workers horizontally without touching the API layer, and to survive worker
                  restarts without losing a single submission.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { num: "01", name: "React Frontend", role: "UI layer", note: "Submission page, leaderboard, blogs, and user dashboard." },
                  { num: "02", name: "Express API", role: "REST monolith", note: "Single server handling auth, problems, submissions, blogs, and users via 6 route modules." },
                  { num: "03", name: "Node.js Worker", role: "Async processor", note: "RabbitMQ consumer that runs independently — judges code and writes verdicts without blocking the API." },
                  { num: "04", name: "MongoDB", role: "Primary datastore", note: "All persistent collections: User, Problem, Submission, Blog, Testcase." },
                  { num: "05", name: "Redis", role: "Cache", note: "Leaderboard caching; sub-millisecond reads for frequently queried rankings." },
                  { num: "06", name: "RabbitMQ", role: "Message broker", note: "SUBMISSION_QUEUE buffers jobs between the API and the worker — durable, survives restarts." },
                ].map((s) => (
                  <div key={s.num} className="flex gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <span className="font-mono text-xs font-bold text-gray-300 dark:text-gray-700 mt-0.5 flex-shrink-0 w-5">{s.num}</span>
                    <div>
                      <p className="font-mono font-semibold text-sm text-gray-900 dark:text-white">{s.name}</p>
                      <span className="font-mono text-xs text-gray-400 dark:text-gray-500">{s.role}</span>
                      <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{s.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Features ── */}
            <section id="features">
              <SectionTitle
                label="02 / Features"
                title="Platform Capabilities"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FEATURES.map((f) => (
                  <div key={f.title}
                    className="flex gap-4 p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                    <div>
                      <h3 className="font-mono font-semibold text-gray-900 dark:text-white text-sm">{f.title}</h3>
                      <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Tech Stack ── */}
            <section id="stack">
              <SectionTitle
                label="03 / Tech Stack"
                title="What & Why"
                subtitle="Every technology was chosen to solve a specific engineering challenge — not for hype."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TECH_STACK.map((t) => (
                  <div key={t.name}
                    className={`p-5 rounded-xl border bg-gradient-to-br ${t.color} transition-all hover:shadow-sm`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">{t.icon}</span>
                      <div>
                        <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">{t.name}</p>
                        <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${t.badge}`}>{t.role}</span>
                      </div>
                    </div>
                    <p className="font-mono text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{t.why}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── HLD ── */}
            <section id="hld">
              <SectionTitle
                label="04 / Architecture"
                title="High-Level Design"
                subtitle="The end-to-end flow from browser to sandboxed execution and back."
              />
              <HLDDiagram />
              <p className="font-mono text-xs text-gray-400 dark:text-gray-600 mt-3 text-center">
                Dashed line = WebSocket real-time push
              </p>
            </section>

            {/* ── Database Design ── */}
            <section id="database">
              <SectionTitle
                label="05 / Database Design"
                title="Data Models & Relationships"
                subtitle="MongoDB collections with their fields and cross-collection references."
              />
              <DatabaseSchemaDiagram />
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "User", note: "Central entity. Tracks pointsEarned (+10/20/30 accepted, –5 wrong) and a solvedProblems set to prevent duplicate scoring." },
                  { name: "Problem", note: "Owns testcases as a populated reference array. Worker fetches all testcases in a single populate() call for batch Judge0 submission." },
                  { name: "Contest", note: "Maps problems to custom base points and securely tracks registered participants. Worker checks this to defer standard user points during timed arenas." },
                  { name: "Submission", note: "Append-only log — never updated, only created. Status progresses from Pending via the worker; historical verdicts are preserved." },
                  { name: "Blog", note: "Community editorial layer. Author references the User model so profile & role information is always consistent via populate()." },
                ].map((c) => (
                  <div key={c.name} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <p className="font-mono font-semibold text-sm text-gray-900 dark:text-white mb-1">{c.name}</p>
                    <p className="font-mono text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{c.note}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── System Flows ── */}
            <section id="flows">
              <SectionTitle
                label="05 / System Flows"
                title="Critical Workflows"
              />

              {/* Flow tabs */}
              <div className="flex gap-2 mb-8 flex-wrap">
                {FLOWS.map((f, i) => (
                  <button key={i}
                    onClick={() => setActiveFlow(i)}
                    className={`font-mono text-sm px-4 py-2 rounded-lg border transition-all
                      ${activeFlow === i
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}>
                    {f.title}
                  </button>
                ))}
              </div>

              {FLOWS.map((flow, fi) => fi === activeFlow && (
                <div key={fi}>
                  <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mb-6">{flow.subtitle}</p>
                  <div className="relative">
                    {/* vertical line */}
                    <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-6">
                      {flow.steps.map((step, si) => (
                        <div key={si} className="relative flex gap-5 items-start">
                          <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center">
                            <span className="font-mono text-xs font-bold text-gray-600 dark:text-gray-400">{step.num}</span>
                          </div>
                          <div className="pt-2 pb-2">
                            <p className="font-mono font-semibold text-sm text-gray-900 dark:text-white">{step.label}</p>
                            <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{step.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {/* Submission state machine */}
              <div className="mt-10">
                <p className="font-mono text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-3">Submission State Machine</p>
                <StateMachineDiagram />
                <p className="font-mono text-xs text-gray-400 dark:text-gray-600 mt-2 text-center">State transitions driven by the background worker + Judge0 verdict</p>
              </div>
            </section>

            {/* ── Deep Dives ── */}
            <section id="deepdives">
              <SectionTitle
                label="06 / Deep Dives"
                title="Engineering Decisions"
                subtitle="Click any card to expand the implementation details."
              />
              <div className="space-y-4">
                {DEEP_DIVES.map((d, i) => {
                  const open = expandedDive === i;
                  return (
                    <div key={i}
                      className={`rounded-xl border transition-all duration-200
                        ${open
                          ? "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                          : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}>
                      <button
                        onClick={() => setExpandedDive(open ? null : i)}
                        className="w-full flex items-center gap-4 p-5 text-left">
                        <span className="text-2xl flex-shrink-0">{d.icon}</span>
                        <div className="flex-1">
                          <p className="font-mono font-semibold text-sm text-gray-900 dark:text-white">{d.title}</p>
                        </div>
                        <span className={`font-mono text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}>›</span>
                      </button>
                      {open && (
                        <div className="px-5 pb-5">
                          <p className="font-mono text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{d.content}</p>
                          <pre className="overflow-x-auto text-xs font-mono bg-gray-900 dark:bg-black text-green-400 p-4 rounded-lg border border-gray-700 leading-relaxed">
                            <code>{d.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Auth Flow — extra card with diagram */}
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                <button
                  onClick={() => setExpandedDive("auth")}
                  className="w-full flex items-center gap-4 p-5 text-left">
                  <span className="text-2xl flex-shrink-0">🔑</span>
                  <div className="flex-1">
                    <p className="font-mono font-semibold text-sm text-gray-900 dark:text-white">Authentication Flow — Login & Protected Requests</p>
                  </div>
                  <span className={`font-mono text-gray-400 transition-transform duration-200 ${expandedDive === "auth" ? "rotate-90" : ""}`}>›</span>
                </button>
                {expandedDive === "auth" && (
                  <div className="px-5 pb-5">
                    <p className="font-mono text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      HMP OJ uses JWT stored in an <strong className="text-gray-900 dark:text-white">httpOnly cookie</strong> — invisible to JavaScript, preventing XSS token theft.
                      On every protected request the <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">isAuthenticated</code> middleware reads the cookie,
                      verifies the JWT signature, and injects <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">req.user</code> so controllers never need
                      to re-query MongoDB for the caller's identity.
                    </p>
                    <AuthFlowDiagram />
                  </div>
                )}
              </div>
            </section>

            {/* ── Future ── */}
            <section id="future">
              <SectionTitle
                label="07 / Roadmap"
                title="Future Enhancements"
                subtitle="What's next on the engineering roadmap."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FUTURE.map((f) => (
                  <div key={f.title}
                    className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${f.color} flex-shrink-0`} />
                      <span className="font-mono text-xs text-gray-400 dark:text-gray-500">{f.label}</span>
                    </div>
                    <h3 className="font-mono font-semibold text-sm text-gray-900 dark:text-white mb-1">{f.title}</h3>
                    <p className="font-mono text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-6 font-mono text-xs text-gray-400 dark:text-gray-600">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />In Progress</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" />Planned</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400" />Backlog</span>
              </div>
            </section>

            {/* ── Demo Video ── */}
            <section id="demo">
              <SectionTitle
                label="08 / Demo"
                title="System Demo"
                subtitle="A walkthrough of HMP OJ in action."
              />
              <div className="mt-8 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 aspect-video flex flex-col items-center justify-center relative shadow-sm">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen>
                </iframe>
              </div>
            </section>

            {/* ── Contact ── */}
            <section id="contact">
              <SectionTitle
                label="09 / Contact"
                title="Meet the Developer"
                subtitle="Have questions about the architecture or want to collaborate?"
              />
              <div className="mt-8 p-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                {/* Photo Placeholder */}
                <div className="flex-shrink-0 w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gray-200 dark:bg-gray-700 relative">
                  <img
                    src="/profile.jpg"
                    alt="Subrat Shakya"
                    className="w-full h-full object-cover relative z-10"
                  />
                </div>

                <div className="text-center md:text-left flex-1">
                  <h3 className="font-mono text-2xl font-bold text-gray-900 dark:text-white">Subrat Shakya</h3>
                  <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-xl">
                    Software Engineer & Creator of HMP OJ. Passionate about scalable event-driven architectures and full-stack development.
                  </p>
                  <div className="mt-6 flex justify-center md:justify-start">
                    <a
                      href="https://subratshakya.vercel.app/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-sm px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow hover:shadow-lg transition-all"
                    >
                      View Portfolio →
                    </a>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default EngineeringPage;

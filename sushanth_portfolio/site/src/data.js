export const profile = {
  name: 'Sushanth Kasturi',
  role: 'Founder, AvlokAI',
  tagline: 'AI Automation Agency · Cybersecurity Practitioner',
  pitch:
    'I run AvlokAI, an AI automation agency that designs autonomous workflows, AI agents, and integrations that quietly do the work of an extra team.',
  location: 'Hyderabad, India',
  emailPrimary: 'sushanth@avlokai.com',
  emailFallback: 'ksushanth477@gmail.com',
  phone: '+91 8247686179',
  socials: {
    github: 'https://github.com/Linuxboii',
    linkedin: 'https://www.linkedin.com/in/sushanthkasturi/',
    website: 'https://avlokai.com',
  },
};

export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
];

export const skills = {
  aiAutomation: [
    { name: 'Workflow Automation', detail: 'n8n, custom Python pipelines, Node.js services, cron + queue workers, webhook orchestration' },
    { name: 'AI Agents', detail: 'LangChain, LangGraph, function-calling, tool-use agents' },
    { name: 'LLM Engineering', detail: 'OpenAI, Anthropic Claude, prompt design, evals' },
    { name: 'RAG Systems', detail: 'Vector DBs (Pinecone, Qdrant), chunking, retrieval tuning' },
    { name: 'Integrations & APIs', detail: 'REST, webhooks, OAuth, CRM/Slack/Gmail glue' },
    { name: 'Agency Delivery', detail: 'Discovery → scoping → ship → maintain for SMB clients' },
  ],
  cybersecurity: [
    { name: 'Ethical Hacking & VAPT', detail: 'Web, network, infra penetration testing' },
    { name: 'SOC Operations', detail: 'Wazuh, Suricata, ELK for detection and response' },
    { name: 'Digital Forensics', detail: 'Malware, mobile, dark-web forensics' },
    { name: 'Network Security', detail: 'Firewalls, IDS/IPS, monitoring' },
    { name: 'Scripting', detail: 'Python, Bash, C for automation and tooling' },
    { name: 'Linux', detail: 'Hardening, admin, daily driver' },
  ],
  tools: [
    'Python', 'Node.js', 'Bash', 'n8n', 'FastAPI', 'Celery', 'Redis', 'LangChain', 'OpenAI API', 'Anthropic API',
    'Wazuh', 'Suricata', 'ELK Stack', 'Burp Suite', 'Nmap', 'Wireshark',
    'Git', 'Docker', 'PostgreSQL', 'Linux',
  ],
};

export const projects = [
  {
    title: 'AvlokAI',
    role: 'Founder',
    summary:
      'Founded and operate AvlokAI, an AI automation agency building autonomous workflows and AI agents for small and mid-sized businesses. Lead discovery, scoping, build, and delivery.',
    stack: ['LangChain', 'OpenAI', 'Anthropic', 'n8n', 'Python'],
    link: 'https://avlokai.com',
  },
  {
    title: 'Autonomous Lead-Gen Agent',
    role: 'Build',
    summary:
      'Multi-step AI agent that researches prospects, drafts personalized outreach, schedules sends, and logs replies to CRM. Cuts ~30 hours/week of manual sales ops.',
    stack: ['LangGraph', 'OpenAI', 'Apollo API', 'n8n', 'PostgreSQL'],
    link: null,
  },
  {
    title: 'RAG Knowledge Assistant',
    role: 'Build',
    summary:
      'Retrieval-augmented chatbot grounded in internal docs (PDFs, Notion, Slack). Hybrid search + reranking + citation. Used internally as the agency knowledge base.',
    stack: ['Qdrant', 'Anthropic Claude', 'LangChain', 'FastAPI'],
    link: null,
  },
  {
    title: 'SOC Lab with Wazuh, Suricata, ELK',
    role: 'Build',
    summary:
      'Built a fully functional Security Operations Center lab for Blue Team practice. Implemented log monitoring, threat detection, and automated malware removal via Python scripts integrated with the VirusTotal API.',
    stack: ['Wazuh', 'Suricata', 'ELK', 'Python', 'VirusTotal API'],
    link: 'https://github.com/Linuxboii/',
  },
  {
    title: 'Python Network Scanner',
    role: 'Build',
    summary:
      'CLI tool that scans local networks for connected devices, captures IP and MAC addresses, and writes structured output. Wraps arp-scan as a reusable Python function.',
    stack: ['Python', 'arp-scan', 'Linux'],
    link: 'https://github.com/Linuxboii/Network_Scanner',
  },
  {
    title: 'Digital Forensics Casework',
    role: 'Training engagements',
    summary:
      'Hands-on digital forensics investigations during training at ISOEH, Kolkata. Covered malware analysis, mobile forensics, and dark web investigations. Reported findings with full evidence chains.',
    stack: ['Autopsy', 'Volatility', 'Wireshark', 'Linux'],
    link: null,
  },
];

export const education = [
  {
    period: '2025 to 2028',
    title: 'B.Sc in Cognitive Systems',
    org: 'Loyola Academy Degree and PG College, Hyderabad',
  },
  {
    period: '2023 to 2025',
    title: 'Diploma in Ethical Hacking and Digital Forensics',
    org: 'Indian School of Ethical Hacking (ISOEH), Kolkata',
  },
  {
    period: '2023',
    title: 'Senior Secondary (XII), TGBSE. 77.70%',
    org: 'Sri Chaitanya Junior Kalasala',
  },
  {
    period: '2021',
    title: 'Secondary (X), CBSE. 80.00%',
    org: 'Chinmaya Vidyalaya, Hyderabad',
  },
];

export const training = [
  {
    period: '2023 to 2025',
    title: 'Diploma in Ethical Hacking & Digital Forensics',
    org: 'Indian School of Ethical Hacking (ISOEH), Kolkata',
    detail: 'Digital systems, malware, mobile and dark-web forensics. Python, Bash, C.',
  },
  {
    period: 'Jul 2025 to Aug 2025',
    title: 'SOC Lab, self-built',
    org: 'Independent',
    detail: 'End-to-end Blue Team lab with Wazuh, Suricata, Kibana.',
  },
];

export const achievements = [
  '2nd place at ABP Infocom Capture The Flag, 300+ participants, 2025',
  'Founder of AvlokAI, an AI automation agency serving SMB clients',
  'Built and operates an internal RAG knowledge assistant and autonomous lead-gen agent',
];

export const services = [
  {
    title: 'AI Workflow Automation',
    body:
      'Map manual processes, then replace them with reliable automated pipelines across your CRM, inbox, docs, and tools.',
  },
  {
    title: 'AI Agents & Assistants',
    body:
      'Custom agents that research, write, classify, and act, wired into your real systems with guardrails and evals.',
  },
  {
    title: 'Cybersecurity Consulting',
    body:
      'Penetration testing, SOC build-out, and digital forensics support for organizations that need a clear-eyed second opinion.',
  },
];

import fs from 'fs';

async function generateGraph() {
  const username = 'khelan-mehta';
  const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
  const repos = await reposResponse.json();

  if (!Array.isArray(repos)) {
    console.error('Error fetching repos:', repos);
    return;
  }

  const nodes = [];
  const edges = [];

  // Person node
  nodes.push({ id: 'person', label: 'Khelan Mehta', type: 'person', weight: 10, metadata: { bio: 'Software Engineer', location: 'India' } });

  const languagesMap = new Map();
  const domainsSet = new Set(['Frontend', 'Backend', 'Fullstack']);

  // Repos
  repos.forEach(repo => {
    if (repo.fork) return; // Skip forks maybe, or include them? Let's skip forks.

    const repoId = `repo-${repo.name}`;
    nodes.push({
      id: repoId,
      label: repo.name,
      type: 'repo',
      weight: Math.min(10, 4 + repo.stargazers_count),
      metadata: {
        description: repo.description,
        stars: repo.stargazers_count,
        url: repo.html_url
      }
    });

    edges.push({ id: `e-person-${repoId}`, source: 'person', target: repoId, type: 'owns' });

    if (repo.language) {
      if (!languagesMap.has(repo.language)) {
        languagesMap.set(repo.language, { count: 0, repos: [] });
      }
      languagesMap.get(repo.language).count += 1;
      languagesMap.get(repo.language).repos.push(repoId);
    }
    
    // Simple domain detection
    const desc = (repo.description || '').toLowerCase();
    const name = repo.name.toLowerCase();
    if (desc.includes('react') || name.includes('react') || desc.includes('frontend') || desc.includes('ui') || repo.language === 'TypeScript' || repo.language === 'JavaScript' || repo.language === 'CSS' || repo.language === 'HTML') {
      edges.push({ id: `e-domain-frontend-${repoId}`, source: 'domain-frontend', target: repoId, type: 'domain' });
    }
    if (desc.includes('node') || desc.includes('api') || desc.includes('backend') || desc.includes('server') || repo.language === 'Python' || repo.language === 'Go') {
      edges.push({ id: `e-domain-backend-${repoId}`, source: 'domain-backend', target: repoId, type: 'domain' });
    }
  });

  // Domains
  nodes.push({ id: 'domain-frontend', label: 'Frontend', type: 'domain', weight: 8 });
  nodes.push({ id: 'domain-backend', label: 'Backend', type: 'domain', weight: 8 });
  edges.push({ id: `e-person-domain-frontend`, source: 'person', target: 'domain-frontend', type: 'focus' });
  edges.push({ id: `e-person-domain-backend`, source: 'person', target: 'domain-backend', type: 'focus' });

  // Languages
  languagesMap.forEach((data, lang) => {
    const langId = `lang-${lang}`;
    nodes.push({
      id: langId,
      label: lang,
      type: 'language',
      weight: Math.min(10, 2 + data.count),
      metadata: { count: data.count }
    });
    edges.push({ id: `e-person-${langId}`, source: 'person', target: langId, type: 'knows' });

    data.repos.forEach(repoId => {
      edges.push({ id: `e-${langId}-${repoId}`, source: langId, target: repoId, type: 'uses' });
    });
  });

  // Some tools and skills
  const tools = ['Git', 'Docker', 'React', 'Node.js', 'Vite', 'TypeScript'];
  tools.forEach(tool => {
    const toolId = `tool-${tool}`;
    nodes.push({ id: toolId, label: tool, type: 'tool', weight: 7 });
    edges.push({ id: `e-person-${toolId}`, source: 'person', target: toolId, type: 'uses' });
  });

  fs.writeFileSync('src/graphData.json', JSON.stringify({ nodes, edges }, null, 2));
  console.log('Graph data generated successfully at src/graphData.json');
}

generateGraph();

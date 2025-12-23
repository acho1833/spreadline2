'use client';

import React, { useState } from 'react';

/**
 * Comprehensive Documentation for /fetchSpreadLine Endpoint
 *
 * This page contains complete documentation for understanding and converting
 * the Python /fetchSpreadLine endpoint to TypeScript.
 *
 * Created: 2025-12-23
 */

export default function FetchSpreadLineDocumentation() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [showCode, setShowCode] = useState<{[key: string]: boolean}>({});

  // CSV Schema definitions based on actual data
  const csvSchemas = {
    relations: {
      name: 'relations.csv',
      description: 'Co-authorship relationships between researchers over time',
      path: 'case-studies/vis-author/relations.csv',
      shape: '(7730 rows, 7 columns)',
      purpose: 'Defines the network topology - who collaborated with whom and when',
      columns: [
        { name: 'year', type: 'int', description: 'Publication year', example: '2002' },
        { name: 'source', type: 'string', description: 'First author / source node', example: '"Jeffrey Heer"' },
        { name: 'target', type: 'string', description: 'Co-author / target node', example: '"James A. Landay"' },
        { name: 'id', type: 'string', description: 'Unique paper ID hash', example: '"53e..."' },
        { name: 'type', type: 'string', description: 'Always "Co-co-author"', example: '"Co-co-author"' },
        { name: 'citationcount', type: 'float', description: 'Citations received by paper', example: '125.0' },
        { name: 'count', type: 'int', description: 'Edge weight (always 1 for papers)', example: '1' }
      ],
      sample: `year,source,target,id,citationcount
2002,"Jeffrey Heer","James A. Landay","53e...",125.0
2005,"Jeffrey Heer","Maneesh Agrawala","53e...",203.0`
    },
    entities: {
      name: 'entities.csv',
      description: 'Author metadata including affiliations over time',
      path: 'case-studies/vis-author/entities.csv',
      shape: '(9978 rows, 4 columns)',
      purpose: 'Provides institutional affiliation data for coloring internal vs external collaborators',
      columns: [
        { name: 'name', type: 'string', description: 'Author full name', example: '"Jeffrey Heer"' },
        { name: 'year', type: 'int', description: 'Year of affiliation', example: '2002' },
        { name: 'citationcount', type: 'int', description: 'Total citations that year', example: '932' },
        { name: 'affiliation', type: 'string', description: 'Institution name', example: '"UC Berkeley, USA"' }
      ],
      sample: `name,year,affiliation
"Jeffrey Heer",2002,"UC Berkeley, USA"
"Jeffrey Heer",2009,"Stanford University, USA"`
    },
    citations: {
      name: 'citations.csv',
      description: 'Citation counts aggregated by author and paper',
      path: 'case-studies/vis-author/citations.csv',
      shape: '(10139 rows, 5 columns)',
      purpose: 'Used to compute node context values (shown as node sizes or colors)',
      columns: [
        { name: 'name', type: 'string', description: 'Author name', example: '"Jeffrey Heer"' },
        { name: 'year', type: 'int', description: 'Publication year', example: '2005' },
        { name: 'citationcount', type: 'int', description: 'Citations for this author on this paper', example: '125' },
        { name: 'affiliation', type: 'string', description: 'Author affiliation', example: '"Stanford University, USA"' },
        { name: 'paperID', type: 'string', description: 'Paper identifier', example: '"53e..."' }
      ],
      sample: `name,year,citationcount,paperID
"Jeffrey Heer",2005,125,"53e..."
"Maneesh Agrawala",2005,125,"53e..."`
    },
    content: {
      name: 'content.csv',
      description: 'Precomputed 2D spatial layout positions for authors',
      path: 'case-studies/vis-author/Heer/content.csv',
      shape: '(427 rows, 4 columns)',
      purpose: 'Provides attribute-driven layout coordinates for contextual positioning',
      columns: [
        { name: 'year', type: 'int', description: 'Year timestamp', example: '2002' },
        { name: 'name', type: 'string', description: 'Author name', example: '"Jeffrey Heer"' },
        { name: 'posX', type: 'float', description: 'X position (0-1 normalized)', example: '0.655' },
        { name: 'posY', type: 'float', description: 'Y position (0-1 normalized)', example: '0.592' }
      ],
      sample: `year,name,posX,posY
2002,"Jeffrey Heer",0.655,0.592
2005,"Maneesh Agrawala",0.741,0.698`
    }
  };

  // Pipeline phase details
  const pipelinePhases = [
    {
      id: 1,
      name: 'Ordering',
      file: 'order.py',
      description: 'Reduces visual crossings using barycenter heuristic',
      algorithm: 'Barycenter Sort with Constrained Crossing Reduction',
      input: 'Session table, Entity timelines',
      output: 'Order table (numEntities × numTimestamps) + ordered entities/sessions',
      why: 'Minimizes edge crossings in the visualization to improve readability',
      details: [
        'Performs 10 iterations of forward + backward sweeping',
        'Each sweep applies constrained crossing reduction within hops',
        'Respects predefined constraints (ego position, hop structure, groups)',
        'Computes barycenter: sum(previousOrders) / entityWeight',
        'Sorts sessions by barycenter value to minimize crossings',
        'Outputs: orderTable, orderedEntities, orderedIdleEntities, orderedSessions'
      ],
      complexity: 'O(n² × m × i) where n=entities, m=timestamps, i=iterations(10)',
      tsNotes: 'Replace NumPy argsort with custom sparseArgsort. Use 2D arrays instead of ndarray.'
    },
    {
      id: 2,
      name: 'Aligning',
      file: 'align.py',
      description: 'Maximizes straight lines across consecutive timestamps',
      algorithm: 'Longest Common Substring with Dynamic Programming',
      input: 'Ordered entities from Phase 1',
      output: 'Align table (entity-to-entity alignments) + session align table',
      why: 'Straight lines are easier to follow visually than bent/wiggled lines',
      details: [
        'Computes reward matrix for all (currEntity, nextEntity) pairs',
        'Reward = numStraightLines + α×(1 - |relativePositionDiff|) where α=0.1',
        'Ensures ego always aligns to itself (reward = Infinity)',
        'Uses DP to find optimal alignment maximizing total reward',
        'Backtraces to build alignTable mapping curr→next entity indices',
        'Creates sessionAlignTable from entity alignments'
      ],
      complexity: 'O(n² × m) for reward computation + O(n²) per timestamp for DP LCS',
      tsNotes: 'Math.inf for infinity. Implement 2D DP table with nested objects/arrays.'
    },
    {
      id: 3,
      name: 'Compacting',
      file: 'compact.py',
      description: 'Minimizes whitespace or line wiggles',
      algorithm: 'Slot-based Height Assignment with Alignment Constraints',
      input: 'Ordered entities, session alignments, config.minimize',
      output: 'Height table (screen Y coordinates) + side table (crossing indicators)',
      why: 'Removes unnecessary whitespace and optionally minimizes line bending',
      details: [
        'Constructs "slots" (horizontal bands) for sessions across time',
        'Ensures ego session always stays in same slot (egoSlotIdx)',
        'Places aligned sessions in corresponding slots',
        'Assigns unaligned sessions to available slots above/below ego',
        'Creates new slots when no space available (maintains order)',
        'Two modes: minimize="space" (compact) or "wiggles" (straighten)',
        'Computes final heights with distance constants: LINE=5, HOP=10, SESSION=5'
      ],
      complexity: 'O(s × m) where s=slots (~entities), m=timestamps',
      tsNotes: 'Most complex module (812 lines). Careful with slot insertion logic and index shifts.'
    },
    {
      id: 4,
      name: 'Contextualizing',
      file: 'contextualize.py',
      description: 'Processes attribute-driven layout coordinates',
      algorithm: 'PCA-based Dimensionality Reduction or Predefined Layout Mapping',
      input: 'Content CSV (positions or high-dim attributes)',
      output: 'Normalized 2D layout: entity×timestamp → (posX, posY)',
      why: 'Shows semantic relationships (e.g., research areas) via spatial proximity',
      details: [
        'Three modes: static/dynamic content × generated/predefined layout',
        'For predefined: maps (entity, timestamp) → (posX, posY) from CSV',
        'For generated: applies PCA to reduce attributes to 2D',
        'Handles missing timestamps with "closest" strategy (binary search)',
        'Normalizes all coordinates to [0,1] range: (x-min)/(max-min)',
        'Optional centering: shifts ego to (0.5, 0.5)'
      ],
      complexity: 'O(n × m) for mapping, O(n × d²) for PCA if needed',
      tsNotes: 'PCA requires ml-matrix or tensorflow.js. Or use predefined layouts to avoid dependency.'
    },
    {
      id: 5,
      name: 'Rendering',
      file: 'render.py',
      description: 'Generates SVG paths and screen coordinates',
      algorithm: 'D3-style scaleBand + Bezier Curve Path Generation',
      input: 'All tables from phases 1-4 + screen width/height',
      output: 'Complete render object: {storylines, blocks, timeLabels, heightExtents}',
      why: 'Converts abstract data structures to visual SVG elements for web display',
      details: [
        'fit_time(): Emulates d3.scaleBand() for horizontal time positioning',
        'Handles bandStretch config to expand specific time periods',
        'fit_entities(): Maps (entity, timestamp) → screen (x,y) coordinates',
        'prepare_line_segments(): Generates SVG paths using Path class',
        'Uses bezierCurveTo() for smooth curve connections',
        'Computes line colors from _line_color dict',
        'Outputs: storylines[], blocks[], timeLabels[], heightExtents, bandWidth'
      ],
      complexity: 'O(n × m) for coord mapping + O(n × m) for path generation',
      tsNotes: 'Path class translates directly. Template literal for SVG string building.'
    }
  ];

  // Data transformation steps
  const transformationSteps = [
    {
      step: 1,
      phase: 'Data Loading',
      name: 'Load CSV Files',
      input: '4 CSV files on disk',
      output: 'Pandas DataFrames',
      transformation: 'File I/O → In-memory tables',
      why: 'Load raw data into memory for processing',
      pythonCode: `relations = pd.read_csv('relations.csv')
entities = pd.read_csv('entities.csv')
citations = pd.read_csv('citations.csv')
content = pd.read_csv('content.csv')`,
      tsEquivalent: `// Use papaparse or csv-parser
const relations = await loadCSV('relations.csv');
const entities = await loadCSV('entities.csv');
// Returns array of objects: {year: 2002, source: "...", ...}[]`
    },
    {
      step: 2,
      phase: 'Data Preparation',
      name: 'Construct Egocentric Network',
      input: 'relations DataFrame (7730 rows)',
      output: 'Filtered network (365 rows) within 2 hops of ego',
      transformation: '2-hop BFS traversal per timestamp → Filter edges',
      why: 'Focus on ego\'s local neighborhood, discard irrelevant distant nodes',
      pythonCode: `def construct_egocentric_network(ego, data):
    HOP_LIMIT = 2
    indices = pd.Index([])
    for _, entries in data.groupby('time'):
        waitlist = {ego}
        hop = 1
        while hop <= HOP_LIMIT:
            next_waitlist = []
            for node in waitlist:
                sources = entries[entries['target'] == node]
                targets = entries[entries['source'] == node]
                candidates = concat([sources['source'], targets['target']]).unique()
                indices = indices.union(sources.index, targets.index)
                next_waitlist.extend(candidates)
            waitlist = set(next_waitlist) - waitlist
            hop += 1
    return data.loc[indices]`,
      tsEquivalent: `function constructEgocentricNetwork(ego: string, data: Edge[]): Edge[] {
  const HOP_LIMIT = 2;
  let indices = new Set<number>();
  const byTime = groupBy(data, 'time');
  for (const [time, entries] of Object.entries(byTime)) {
    let waitlist = new Set([ego]);
    let hop = 1;
    while (waitlist.size > 0 && hop <= HOP_LIMIT) {
      const nextWaitlist = new Set<string>();
      for (const node of waitlist) {
        const sources = entries.filter(e => e.target === node);
        const targets = entries.filter(e => e.source === node);
        sources.forEach((_, i) => indices.add(i));
        targets.forEach((_, i) => indices.add(i));
        const candidates = [...sources.map(e => e.source), ...targets.map(e => e.target)];
        candidates.forEach(c => nextWaitlist.add(c));
      }
      waitlist = new Set([...nextWaitlist].filter(n => !waitlist.has(n)));
      hop++;
    }
  }
  return data.filter((_, i) => indices.has(i));
}`
    },
    {
      step: 3,
      phase: 'Data Preparation',
      name: 'Remap Affiliations',
      input: 'Raw affiliation strings',
      output: 'Canonical institution names',
      transformation: 'Pattern matching → Standardized names',
      why: 'Group collaborators by institution (internal vs external)',
      pythonCode: `def _remap_JH_affiliation(affiliation):
    if not isinstance(affiliation, str):
        return "University of Washington, USA"
    if "Berkeley" in affiliation:
        return "UC Berkeley, USA"
    if "PARC" in affiliation or "Xerox" in affiliation:
        return "Palo Alto Research Center, USA"
    if "Stanford" in affiliation:
        return "Stanford University, USA"
    if "Washington" in affiliation:
        return "University of Washington, USA"
    return affiliation`,
      tsEquivalent: `function remapJHAffiliation(affiliation: string | null): string {
  if (!affiliation) return "University of Washington, USA";
  if (affiliation.includes("Berkeley")) return "UC Berkeley, USA";
  if (affiliation.includes("PARC") || affiliation.includes("Xerox"))
    return "Palo Alto Research Center, USA";
  if (affiliation.includes("Stanford")) return "Stanford University, USA";
  if (affiliation.includes("Washington")) return "University of Washington, USA";
  return affiliation;
}`
    },
    {
      step: 4,
      phase: 'Data Preparation',
      name: 'Construct Author Groups',
      input: 'Network + entity affiliations',
      output: 'Groups dict: {year: [[ext_nonfirst], [ext_first], [ego], [int_first], [int_nonfirst]]}',
      transformation: 'Classify each author by (1) relationship to ego (2) affiliation match',
      why: 'Pre-define constraints for ordering algorithm',
      pythonCode: `# For each year, create 5 groups:
# 0: external non-first authors
# 1: external first authors
# 2: ego
# 3: internal first authors
# 4: internal non-first authors

for idx, row in network.iterrows():
    firstAuthor = row['source']
    author = row['target']
    year = row['year']
    egoAffiliations = get_affiliations(ego, year)

    if year not in groupAssign:
        groupAssign[year] = [set(), set(), {ego}, set(), set()]

    if author == ego:
        # Ego is non-first, classify the first author
        affiliations = get_affiliations(firstAuthor, year)
        isInternal = bool(set(affiliations) & egoAffiliations)
        groupIdx = 3 if isInternal else 1
        groupAssign[year][groupIdx].add(firstAuthor)
    else:
        # Ego is first or this is about another author
        affiliations = get_affiliations(author, year)
        isInternal = bool(set(affiliations) & egoAffiliations)
        groupIdx = 4 if isInternal else 0
        groupAssign[year][groupIdx].add(author)`,
      tsEquivalent: `// Similar structure with TypeScript types
type Groups = [Set<string>, Set<string>, Set<string>, Set<string>, Set<string>];
const groupAssign: Record<string, Groups> = {};

for (const row of network) {
  const {source: firstAuthor, target: author, year} = row;
  const egoAffiliations = getAffiliations(ego, year);

  if (!groupAssign[year]) {
    groupAssign[year] = [new Set(), new Set(), new Set([ego]), new Set(), new Set()];
  }

  // ... rest of logic same as Python
}`
    },
    {
      step: 5,
      phase: 'SpreadLine Pipeline',
      name: 'SpreadLine.load(topology)',
      input: 'Network DataFrame',
      output: 'Internal this._topo table',
      transformation: 'Column renaming + validation → Internal storage',
      why: 'Normalize column names for consistent access',
      pythonCode: `SpreadLiner.load(network, config={
    'source': 'source',
    'target': 'target',
    'time': 'year',
    'weight': 'count'
})

# Inside load():
invConfig = {val: key for key, val in config.items()}
receipient.rename(columns=invConfig, inplace=True)
self._topo = receipient`,
      tsEquivalent: `spreadLiner.load(network, {
  config: {
    source: 'source',
    target: 'target',
    time: 'year',
    weight: 'count'
  }
});

// Inside load():
const invConfig = Object.fromEntries(
  Object.entries(config).map(([k, v]) => [v, k])
);
const renamed = data.map(row => renameKeys(row, invConfig));
this._topo = renamed;`
    },
    {
      step: 6,
      phase: 'SpreadLine Pipeline',
      name: 'SpreadLine.load(line/node/content)',
      input: 'LineColor DF, NodeContent DF, ContentLayout DF',
      output: 'this._line_color, this._node_color, this._content',
      transformation: 'Store in appropriate internal structures',
      why: 'Separate concerns: topology vs colors vs context',
      pythonCode: `# Line colors: entity → color mapping
SpreadLiner.load(lineColor, config={'entity': 'entity', 'color': 'color'}, key='line')
# Stores as: {'Author Name': '#FA9902', ...}

# Node colors: (entity, time) → context value
SpreadLiner.load(nodeContent, config={'time': 'time', 'entity': 'entity', 'context': 'context'}, key='node')

# Content layout: (entity, time) → (posX, posY)
SpreadLiner.load(layout, config={'timestamp': 'year', 'id': 'name', 'posX': 'posX', 'posY': 'posY'}, key='content')`,
      tsEquivalent: `// Line colors
this._line_color = Object.fromEntries(
  lineColor.map(row => [row.entity, row.color])
);

// Node colors
this._node_color = nodeContent;

// Content layout
this._content = layout;`
    },
    {
      step: 7,
      phase: 'SpreadLine Pipeline',
      name: 'SpreadLine.center()',
      input: 'this._topo + ego + time params + groups',
      output: 'Entities, Sessions, Tables (session, presence)',
      transformation: 'Complex multi-step construction',
      why: 'Build core data structures for optimization',
      pythonCode: `SpreadLiner.center(ego='Jeffrey Heer', timeDelta='year', timeFormat='%Y', groups=groups)

# Internal steps:
# 1. Convert time strings to datetime
self._topo['time'] = self._topo['time'].apply(lambda x: str_to_datetime(x, timeFormat))

# 2. Filter to timestamps where ego exists
self._topo = filter_time_by_ego(ego, self._topo)

# 3. Generate time array
self._all_timestamps = get_time_array(timeExtents, timeDelta, timeFormat)

# 4. Construct 2-hop egocentric network
network = construct_egocentric_network(ego, self._topo)

# 5. Create Entity objects
self._construct_entities(network)

# 6. Create Session objects (contact sessions)
sessions = self._construct_contact_sessions(network, timeArray)

# 7. Fill timelines with idle sessions
self._construct_timelines_idle_sessions(sessions)

# 8. Build session and presence tables
self._construct_tables()

# Result:
# - self.entities: List[Entity] (198 entities for Heer)
# - self.sessions: List[Session] (21 contact sessions)
# - self._tables: {session: ndarray, presence: ndarray}
# - self.effective_timestamps: timestamps with actual changes`,
      tsEquivalent: `spreadLiner.center({
  ego: 'Jeffrey Heer',
  timeDelta: 'year',
  timeFormat: '%Y',
  groups
});

// Similar sequence of steps in TypeScript
// Use Date objects instead of datetime
// Build Entity and Session class instances
// Create 2D arrays for tables`
    },
    {
      step: 8,
      phase: 'SpreadLine Pipeline',
      name: 'SpreadLine.configure()',
      input: 'Config options',
      output: 'Updated this._config',
      transformation: 'Merge user config into defaults',
      why: 'Customize optimization behavior',
      pythonCode: `SpreadLiner.configure({
    "squeezeSameCategory": True,
    "minimize": "wiggles"  # or "space"
})

# Affects compacting phase:
# - squeezeSameCategory: reduce distance between same-color entities
# - minimize: optimize for straight lines vs whitespace`,
      tsEquivalent: `spreadLiner.configure({
  squeezeSameCategory: true,
  minimize: 'wiggles'
});

this._config = {...this._config, ...config};`
    },
    {
      step: 9,
      phase: 'SpreadLine Pipeline',
      name: 'SpreadLine.fit() → Phase 1: Ordering',
      input: 'Session table, entity timelines, groups',
      output: 'Order table + orderedEntities',
      transformation: 'Barycenter sweeping iterations',
      why: 'Minimize edge crossings',
      pythonCode: `orderTable, orderedEntities, orderedIdleEntities, orderedSessions = ordering(self)

# 10 iterations of forward + backward sweep
# Each session has barycenter = sum(prevOrders) / numEntities
# Sort sessions by barycenter
# Respect constraints from groups
# Output: orderTable[entity, time] = order position`,
      tsEquivalent: `const {orderTable, orderedEntities, orderedIdleEntities, orderedSessions} = ordering(this);

// Implement barycenter calculation
// Use Array.sort() with custom comparator`
    },
    {
      step: 10,
      phase: 'SpreadLine Pipeline',
      name: 'SpreadLine.fit() → Phase 2: Aligning',
      input: 'Ordered entities from Phase 1',
      output: 'Align table + sessionAlignTable',
      transformation: 'Longest common substring DP',
      why: 'Maximize straight lines',
      pythonCode: `alignTable, sessionAlignTable = aligning(self, orderedEntities, orderedIdleEntities)

# For each pair of consecutive timestamps:
# 1. Compute reward[i][j] for aligning entity i → j
# 2. Run LCS DP to find max-reward alignment
# 3. Backtrace to build alignTable
# 4. Derive sessionAlignTable from entity alignments`,
      tsEquivalent: `const {alignTable, sessionAlignTable} = aligning(
  this,
  orderedEntities,
  orderedIdleEntities
);

// 2D DP table: matchTable[i][j]
// direction[i][j] ∈ {0: align, 1: skip right, 2: skip left}`
    },
    {
      step: 11,
      phase: 'SpreadLine Pipeline',
      name: 'SpreadLine.fit() → Phase 3: Compacting',
      input: 'Ordered entities, session alignments, minimize config',
      output: 'Height table + side table',
      transformation: 'Slot construction + height assignment',
      why: 'Remove whitespace or straighten lines',
      pythonCode: `heightTable, sideTable = compacting(self, orderedEntities, orderedSessions, sessionAlignTable)

# 1. Construct slots (horizontal bands)
# 2. Ensure ego always in same slot
# 3. Place aligned sessions
# 4. Fill unaligned sessions
# 5. Compute heights based on slot positions
# Output: heightTable[entity, time] = screen Y coordinate`,
      tsEquivalent: `const {heightTable, sideTable} = compacting(
  this,
  orderedEntities,
  orderedSessions,
  sessionAlignTable
);

// Most complex phase - 812 lines
// Careful with array mutations and index tracking`
    },
    {
      step: 12,
      phase: 'SpreadLine Pipeline',
      name: 'SpreadLine.fit() → Phase 4: Contextualizing',
      input: 'Content CSV data',
      output: 'Normalized (entity, time) → (posX, posY) layout',
      transformation: 'Mapping or PCA + normalization',
      why: 'Add semantic positioning',
      pythonCode: `context = contextualizing(self)

# Map (entity, timestamp) to content.csv positions
# Normalize to [0, 1]: (x - min) / (max - min)
# Returns: {layout: DataFrame with (entity, time) → (posX, posY)}`,
      tsEquivalent: `const context = contextualizing(this);

// Map entity+time to positions
// Normalize: (x - min) / (max - min)`
    },
    {
      step: 13,
      phase: 'SpreadLine Pipeline',
      name: 'SpreadLine.fit() → Phase 5: Rendering',
      input: 'All tables + screen width/height',
      output: 'Final render object',
      transformation: 'Screen coordinate mapping + SVG path generation',
      why: 'Produce visual output',
      pythonCode: `result = rendering({'width': 2800, 'height': 1000}, self)

# Returns:
{
    "bandWidth": 101.816,
    "blockWidth": 40,
    "ego": "Jeffrey Heer",
    "timeLabels": [{label: "2002", posX: 50}, ...],
    "storylines": [
        {
            "name": "Jeffrey Heer",
            "lines": [
                {"path": "M100,200C150,200,150,250,200,250L..."}
            ],
            "color": "#424242",
            ...
        },
        ...
    ],
    "blocks": [...],
    "heightExtents": [0, 912]
}`,
      tsEquivalent: `const result = rendering({width: 2800, height: 1000}, this);

// Use template literals for SVG path strings
// Path class methods: moveTo, lineTo, bezierCurveTo`
    },
    {
      step: 14,
      phase: 'Finalization',
      name: 'Add Reference Data & Return',
      input: 'result from rendering + reference CSV',
      output: 'Complete API response',
      transformation: 'Merge additional metadata',
      why: 'Provide complete dataset to frontend',
      pythonCode: `reference = pd.read_csv('Heer/content_reference.csv')
result.update({
    "mode": "author",
    "reference": reference.to_dict(orient='records')
})
return result`,
      tsEquivalent: `const reference = await loadCSV('Heer/content_reference.csv');
return {
  ...result,
  mode: 'author',
  reference
};`
    }
  ];

  const tabs = [
    { id: 'overview', label: '📋 Overview', icon: '📋' },
    { id: 'architecture', label: '🏗️ Architecture', icon: '🏗️' },
    { id: 'csv', label: '📊 CSV Data', icon: '📊' },
    { id: 'flow', label: '🔄 Data Flow', icon: '🔄' },
    { id: 'pipeline', label: '⚙️ Pipeline', icon: '⚙️' },
    { id: 'source', label: '💻 Source', icon: '💻' },
    { id: 'test', label: '🧪 Test', icon: '🧪' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', padding: '2.5rem', marginBottom: '2rem', borderTop: '6px solid #667eea' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1a202c', margin: '0 0 1rem 0' }}>
            /fetchSpreadLine Endpoint
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#718096', marginBottom: '2rem' }}>
            Complete Technical Documentation for Python → TypeScript Conversion
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Entities', value: '198', color: '#667eea' },
              { label: 'Time Steps', value: '21', color: '#48bb78' },
              { label: 'Phases', value: '5', color: '#ed64a6' },
              { label: 'Python Lines', value: '2,976', color: '#ed8936' }
            ].map((stat, i) => (
              <div key={i} style={{ background: `${stat.color}15`, padding: '1.25rem', borderRadius: '12px', border: `2px solid ${stat.color}30` }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.875rem', color: '#4a5568', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1.25rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: 'none',
                  background: activeTab === tab.id ? '#edf2f7' : 'transparent',
                  borderBottom: activeTab === tab.id ? '4px solid #667eea' : '4px solid transparent',
                  color: activeTab === tab.id ? '#667eea' : '#718096',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '2.5rem' }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem' }}>
                  System Overview
                </h2>

                <div style={{ fontSize: '1.125rem', lineHeight: '1.75', color: '#4a5568', marginBottom: '2rem' }}>
                  <p>
                    The <code style={{ background: '#edf2f7', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#667eea' }}>/fetchSpreadLine</code> endpoint
                    is a Flask API that generates SpreadLine visualizations for egocentric dynamic networks.
                    It processes co-authorship data centered around a focal author (ego) and creates an optimized
                    timeline visualization showing how collaboration influence spreads over time.
                  </p>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1.5rem', borderRadius: '12px', color: 'white', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>🎯 Key Objectives</h3>
                  <ul style={{ lineHeight: '1.75', paddingLeft: '1.5rem' }}>
                    <li>Visualize temporal evolution of collaboration networks from ego's perspective</li>
                    <li>Minimize visual clutter through crossing reduction and alignment optimization</li>
                    <li>Incorporate contextual information (citations, affiliations) into spatial layout</li>
                    <li>Generate production-ready SVG paths for web rendering</li>
                  </ul>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#f0fff4', padding: '1.5rem', borderRadius: '12px', border: '2px solid #9ae6b4' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#22543d', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>📥</span> Input
                    </h3>
                    <ul style={{ fontSize: '0.875rem', color: '#2d3748', lineHeight: '1.75', paddingLeft: '1.25rem' }}>
                      <li><strong>relations.csv</strong> - Network topology (edges)</li>
                      <li><strong>entities.csv</strong> - Author metadata & affiliations</li>
                      <li><strong>citations.csv</strong> - Citation counts per paper</li>
                      <li><strong>content.csv</strong> - Precomputed 2D spatial positions</li>
                    </ul>
                  </div>

                  <div style={{ background: '#ebf8ff', padding: '1.5rem', borderRadius: '12px', border: '2px solid #90cdf4' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c5282', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>📤</span> Output
                    </h3>
                    <ul style={{ fontSize: '0.875rem', color: '#2d3748', lineHeight: '1.75', paddingLeft: '1.25rem' }}>
                      <li><strong>storylines</strong> - SVG paths for each entity (198)</li>
                      <li><strong>blocks</strong> - Time period session blocks (21)</li>
                      <li><strong>timeLabels</strong> - X-axis year labels (2002-2023)</li>
                      <li><strong>heightExtents</strong> - Y-axis range [0, 912]</li>
                    </ul>
                  </div>
                </div>

                <div style={{ background: '#fffaf0', padding: '1.5rem', borderRadius: '12px', border: '2px solid #fbd38d' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#7c2d12', marginBottom: '1rem' }}>
                    ⚠️ TypeScript Conversion Considerations
                  </h3>
                  <ul style={{ fontSize: '0.875rem', color: '#2d3748', lineHeight: '1.75', paddingLeft: '1.25rem' }}>
                    <li><strong>NumPy arrays</strong> → Use TypedArrays (Float64Array) or regular number[][]</li>
                    <li><strong>Pandas DataFrames</strong> → Custom interfaces with array operations</li>
                    <li><strong>Python datetime</strong> → JavaScript Date API</li>
                    <li><strong>Scientific libs (scipy, sklearn)</strong> → Find JS alternatives or implement approximations</li>
                    <li><strong>Floating-point precision</strong> → May differ; ensure consistent rounding strategies</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Architecture Tab - Due to length, showing abbreviated version */}
            {activeTab === 'architecture' && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>System Architecture</h2>

                {/* High-level architecture diagram */}
                <div style={{ background: '#f7fafc', padding: '2rem', borderRadius: '12px', border: '2px solid #cbd5e0', marginBottom: '2rem' }}>
                  <h3 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '600', marginBottom: '2rem' }}>
                    High-Level Architecture
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { layer: 'API Layer', file: 'demo/backend/views.py', func: 'computeJHSpreadLine()', color: '#fc8181' },
                      { layer: 'Data Preparation', file: 'views.py helpers', func: '_construct_author_network(), _remap_JH_affiliation()', color: '#f6ad55' },
                      { layer: 'SpreadLine Core', file: 'SpreadLine/spreadline.py', func: '.load() → .center() → .configure() → .fit()', color: '#4299e1' },
                      { layer: '5-Phase Pipeline', file: 'order→align→compact→context→render', func: 'Optimization algorithms', color: '#48bb78' },
                      { layer: 'Output', file: 'JSON Response', func: '{storylines, blocks, timeLabels, ...}', color: '#9f7aea' }
                    ].map((item, i) => (
                      <React.Fragment key={i}>
                        <div style={{ background: `${item.color}20`, padding: '1.25rem', borderRadius: '8px', border: `2px solid ${item.color}` }}>
                          <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1a202c', marginBottom: '0.5rem' }}>{item.layer}</div>
                          <div style={{ fontSize: '0.875rem', color: '#4a5568', fontFamily: 'monospace' }}>{item.file}</div>
                          <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.5rem' }}>{item.func}</div>
                        </div>
                        {i < 4 && <div style={{ textAlign: 'center', color: '#a0aec0', fontSize: '1.5rem' }}>↓</div>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Pipeline phases */}
                <div style={{ background: '#edf2f7', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                    5-Phase Processing Pipeline
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                    {pipelinePhases.map(phase => (
                      <div
                        key={phase.id}
                        onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
                        style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          border: activePhase === phase.id ? '3px solid #667eea' : '2px solid #e2e8f0',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', color: '#667eea', fontSize: '0.875rem' }}>{phase.id}. {phase.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.5rem', fontFamily: 'monospace' }}>{phase.file}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active phase detail */}
                {activePhase && (
                  <div style={{ background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)', padding: '1.5rem', borderRadius: '12px', border: '2px solid #667eea' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a202c' }}>
                        Phase {activePhase}: {pipelinePhases[activePhase - 1].name}
                      </h3>
                      <button
                        onClick={() => setActivePhase(null)}
                        style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#718096' }}
                      >
                        ×
                      </button>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#2d3748', lineHeight: '1.75' }}>
                      <p><strong>Algorithm:</strong> {pipelinePhases[activePhase - 1].algorithm}</p>
                      <p><strong>Why:</strong> {pipelinePhases[activePhase - 1].why}</p>
                      <p><strong>Input:</strong> {pipelinePhases[activePhase - 1].input}</p>
                      <p><strong>Output:</strong> {pipelinePhases[activePhase - 1].output}</p>
                      <p><strong>Complexity:</strong> {pipelinePhases[activePhase - 1].complexity}</p>
                      <div style={{ marginTop: '1rem' }}>
                        <strong>Steps:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                          {pipelinePhases[activePhase - 1].details.map((detail, i) => (
                            <li key={i} style={{ marginTop: '0.25rem' }}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                      <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#805ad5' }}>
                        <strong>TS Note:</strong> {pipelinePhases[activePhase - 1].tsNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CSV Tab */}
            {activeTab === 'csv' && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>CSV File Schemas</h2>

                {Object.values(csvSchemas).map((schema, idx) => (
                  <div key={idx} style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e0', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a202c' }}>{schema.name}</h3>
                        <p style={{ color: '#718096', marginTop: '0.25rem' }}>{schema.description}</p>
                      </div>
                      <div style={{ background: '#667eea20', color: '#667eea', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '500' }}>
                        {schema.shape}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#718096', fontFamily: 'monospace', background: '#edf2f7', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
                      {schema.path}
                    </div>

                    <div style={{ background: '#fffaf0', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', color: '#744210' }}>
                      <strong>Purpose:</strong> {schema.purpose}
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.875rem' }}>
                      <thead style={{ background: '#edf2f7' }}>
                        <tr>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#2d3748' }}>Column</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#2d3748' }}>Type</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#2d3748' }}>Description</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#2d3748' }}>Example</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schema.columns.map((col, i) => (
                          <tr key={i} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#805ad5' }}>{col.name}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{ background: '#48bb7820', color: '#22543d', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500' }}>
                                {col.type}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', color: '#4a5568' }}>{col.description}</td>
                            <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#718096' }}>{col.example}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#2d3748', marginBottom: '0.5rem' }}>Sample Data:</div>
                      <pre style={{ fontSize: '0.75rem', background: 'white', padding: '1rem', borderRadius: '6px', overflow: 'auto', border: '1px solid #e2e8f0', fontFamily: 'monospace', color: '#2d3748' }}>
                        {schema.sample}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Data Flow Tab */}
            {activeTab === 'flow' && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Data Transformation Flow</h2>

                <div style={{ background: '#ebf8ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #90cdf4', marginBottom: '2rem' }}>
                  <p style={{ color: '#2c5282', lineHeight: '1.75' }}>
                    This section traces how data transforms through each step, from raw CSV files to the final rendered output.
                    Click on any step to expand and see Python code, TypeScript equivalent, and detailed explanations.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {transformationSteps.map((step, idx) => (
                    <div key={idx} style={{ background: 'white', borderRadius: '12px', border: '2px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <button
                        onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                        style={{
                          width: '100%',
                          padding: '1.25rem',
                          border: 'none',
                          background: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                          <div style={{ background: '#667eea', color: 'white', width: '3rem', height: '3rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem', flexShrink: 0 }}>
                            {step.step}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', color: '#805ad5', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                              {step.phase}
                            </div>
                            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem' }}>
                              {step.name}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                              <span style={{ fontWeight: '500' }}>Input:</span> {step.input}
                              <span style={{ margin: '0 0.5rem', color: '#cbd5e0' }}>→</span>
                              <span style={{ fontWeight: '500' }}>Output:</span> {step.output}
                            </div>
                          </div>
                        </div>
                        <svg
                          style={{ width: '1.5rem', height: '1.5rem', color: '#a0aec0', transition: 'transform 0.2s', transform: expandedStep === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {expandedStep === idx && (
                        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: '#f7fafc' }}>
                          <div style={{ background: '#fefcbf', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            <div style={{ fontWeight: '600', color: '#744210', marginBottom: '0.5rem' }}>🔄 Transformation:</div>
                            <p style={{ color: '#744210', fontSize: '0.875rem', margin: 0 }}>{step.transformation}</p>
                          </div>

                          <div style={{ background: '#fffaf0', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            <div style={{ fontWeight: '600', color: '#7c2d12', marginBottom: '0.5rem' }}>💡 Why:</div>
                            <p style={{ color: '#7c2d12', fontSize: '0.875rem', margin: 0 }}>{step.why}</p>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            <div>
                              <div style={{ background: '#1a202c', color: 'white', padding: '0.75rem 1rem', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.05em' }}>
                                PYTHON
                              </div>
                              <pre style={{ margin: 0, padding: '1rem', background: '#2d3748', color: '#e2e8f0', fontSize: '0.75rem', fontFamily: 'monospace', overflow: 'auto', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                                <code>{step.pythonCode}</code>
                              </pre>
                            </div>

                            <div>
                              <div style={{ background: '#2b6cb0', color: 'white', padding: '0.75rem 1rem', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.05em' }}>
                                TYPESCRIPT EQUIVALENT
                              </div>
                              <pre style={{ margin: 0, padding: '1rem', background: '#2c5282', color: '#e2e8f0', fontSize: '0.75rem', fontFamily: 'monospace', overflow: 'auto', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                                <code>{step.tsEquivalent}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Sequence Diagram */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '2px solid #cbd5e0', marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', textAlign: 'center', marginBottom: '1.5rem' }}>
                    📊 Sequence Diagram: Complete Call Flow
                  </h3>
                  <pre style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.75rem', fontFamily: 'monospace', lineHeight: '1.6', color: '#2d3748' }}>
{`Client
  │
  └─→ GET /fetchSpreadLine
        │
        └─→ computeJHSpreadLine()
              ├─→ pd.read_csv() × 4 files
              │
              ├─→ _construct_author_network(ego, remap_fn)
              │     ├─→ _construct_ego_networks(df, ego, HOP=2)
              │     ├─→ _remap_JH_affiliation(affiliation)
              │     └─→ return (network, lineColor, groups)
              │
              ├─→ SpreadLine.__init__()
              │
              ├─→ .load(network, config)       [topology]
              ├─→ .load(lineColor, config)     [line colors]
              ├─→ .load(nodeContent, config)   [node context]
              ├─→ .load(contentLayout, config) [spatial positions]
              │
              ├─→ .center(ego, timeDelta, timeFormat, groups)
              │     ├─→ filter_time_by_ego()
              │     ├─→ construct_egocentric_network()
              │     ├─→ _construct_entities()
              │     ├─→ _construct_contact_sessions()
              │     ├─→ _construct_timelines_idle_sessions()
              │     └─→ _construct_tables()
              │
              ├─→ .configure({squeezeSameCategory, minimize})
              │
              ├─→ .fit(width=2800, height=1000)
              │     ├─→ ordering()        [Phase 1: crossing reduction]
              │     ├─→ aligning()        [Phase 2: maximize straight lines]
              │     ├─→ compacting()      [Phase 3: minimize space/wiggles]
              │     ├─→ contextualizing() [Phase 4: attribute layout]
              │     └─→ rendering()       [Phase 5: SVG generation]
              │
              └─→ return JSON result
                    ↓
                  Client receives {storylines, blocks, timeLabels, ...}`}
                  </pre>
                </div>
              </div>
            )}

            {/* Pipeline Tab */}
            {activeTab === 'pipeline' && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>5-Phase Processing Pipeline</h2>

                <div style={{ background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                  <p style={{ color: '#2d3748', lineHeight: '1.75', margin: 0 }}>
                    The <code style={{ background: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#667eea' }}>SpreadLine.fit()</code> method
                    orchestrates a sophisticated 5-phase optimization pipeline. Each phase builds upon the previous,
                    progressively refining the layout for visual clarity and information density.
                  </p>
                </div>

                {pipelinePhases.map((phase) => (
                  <div key={phase.id} style={{ background: 'white', borderRadius: '12px', border: '2px solid #e2e8f0', marginBottom: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)', padding: '1.5rem', borderBottom: '1px solid #cbd5e0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', width: '3.5rem', height: '3.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)' }}>
                            {phase.id}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a202c', margin: '0 0 0.25rem 0' }}>
                              {phase.name}
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>{phase.description}</p>
                          </div>
                        </div>
                        <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'monospace', color: '#4a5568', border: '1px solid #cbd5e0' }}>
                          {phase.file}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: '#f0fff4', padding: '1rem', borderRadius: '8px', border: '1px solid #9ae6b4' }}>
                          <div style={{ fontWeight: '600', color: '#22543d', marginBottom: '0.5rem', fontSize: '0.875rem' }}>📥 Input</div>
                          <p style={{ fontSize: '0.875rem', color: '#2d3748', margin: 0 }}>{phase.input}</p>
                        </div>
                        <div style={{ background: '#ebf8ff', padding: '1rem', borderRadius: '8px', border: '1px solid #90cdf4' }}>
                          <div style={{ fontWeight: '600', color: '#2c5282', marginBottom: '0.5rem', fontSize: '0.875rem' }}>📤 Output</div>
                          <p style={{ fontSize: '0.875rem', color: '#2d3748', margin: 0 }}>{phase.output}</p>
                        </div>
                      </div>

                      <div style={{ background: '#fffaf0', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fbd38d' }}>
                        <div style={{ fontWeight: '600', color: '#7c2d12', marginBottom: '0.5rem', fontSize: '0.875rem' }}>💡 Why This Phase?</div>
                        <p style={{ fontSize: '0.875rem', color: '#744210', margin: 0 }}>{phase.why}</p>
                      </div>

                      <div style={{ background: '#faf5ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #d6bcfa' }}>
                        <div style={{ fontWeight: '600', color: '#553c9a', marginBottom: '0.5rem', fontSize: '0.875rem' }}>🧮 Algorithm</div>
                        <p style={{ fontSize: '0.875rem', color: '#553c9a', margin: 0, fontFamily: 'monospace' }}>{phase.algorithm}</p>
                      </div>

                      <div style={{ background: '#f7fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #cbd5e0' }}>
                        <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '0.75rem', fontSize: '0.875rem' }}>📋 Detailed Steps</div>
                        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                          {phase.details.map((detail, i) => (
                            <li key={i} style={{ fontSize: '0.875rem', color: '#4a5568', marginTop: '0.5rem', lineHeight: '1.6' }}>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: '#fff5f5', padding: '1rem', borderRadius: '8px', border: '1px solid #feb2b2' }}>
                          <div style={{ fontWeight: '600', color: '#742a2a', marginBottom: '0.5rem', fontSize: '0.875rem' }}>⏱️ Complexity</div>
                          <p style={{ fontSize: '0.875rem', color: '#742a2a', margin: 0, fontFamily: 'monospace' }}>{phase.complexity}</p>
                        </div>
                        <div style={{ background: '#e6fffa', padding: '1rem', borderRadius: '8px', border: '1px solid #81e6d9' }}>
                          <div style={{ fontWeight: '600', color: '#234e52', marginBottom: '0.5rem', fontSize: '0.875rem' }}>🔧 TypeScript Notes</div>
                          <p style={{ fontSize: '0.875rem', color: '#234e52', margin: 0 }}>{phase.tsNotes}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Source Code Tab - Abbreviated due to length */}
            {activeTab === 'source' && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Python Source Code Reference</h2>

                <div style={{ background: '#fffaf0', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fbd38d', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight: '600', color: '#7c2d12', marginBottom: '0.5rem' }}>For TypeScript Conversion Teams</div>
                      <p style={{ fontSize: '0.875rem', color: '#744210', lineHeight: '1.75', margin: 0 }}>
                        The complete source code is available in the SpreadLine-main directory. Key files to review:
                      </p>
                      <ul style={{ fontSize: '0.875rem', color: '#744210', lineHeight: '1.75', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li><code>demo/backend/views.py</code> - Flask endpoint (320 lines)</li>
                        <li><code>SpreadLine/spreadline.py</code> - Core class (347 lines)</li>
                        <li><code>SpreadLine/utils/types.py</code> - Data structures (263 lines)</li>
                        <li><code>SpreadLine/order.py</code> - Ordering algorithm (155 lines)</li>
                        <li><code>SpreadLine/align.py</code> - Alignment algorithm (177 lines)</li>
                        <li><code>SpreadLine/compact.py</code> - Compacting algorithm (812 lines) ⚠️ MOST COMPLEX</li>
                        <li><code>SpreadLine/contextualize.py</code> - Context layout (149 lines)</li>
                        <li><code>SpreadLine/render.py</code> - Rendering (575 lines)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>📦 Total Codebase Size</h3>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', marginTop: '1rem' }}>2,976</div>
                  <div style={{ fontSize: '1.125rem', opacity: 0.9 }}>Lines of Python Code to Convert</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.75, marginTop: '1rem' }}>
                    10 modules • 4 CSV schemas • 5 algorithm phases • 3 data structures
                  </div>
                </div>
              </div>
            )}

            {/* Test Tab */}
            {activeTab === 'test' && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Unit Test with Trace Logging</h2>

                <div style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)', padding: '1.5rem', borderRadius: '12px', border: '2px solid #48bb78', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>🧪</span>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#22543d', marginBottom: '0.5rem' }}>
                        Comprehensive Test with 24 Traced Steps
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#22543d', lineHeight: '1.75', margin: 0 }}>
                        A detailed unit test captures the complete data transformation pipeline with extensive logging
                        at every step. Run this test to understand the exact flow and verify your TypeScript conversion.
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', border: '2px solid #cbd5e0', marginBottom: '2rem' }}>
                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>📋 How to Run the Test</h3>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div style={{ background: '#667eea', color: 'white', width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem', flexShrink: 0 }}>
                          1
                        </div>
                        <div style={{ fontWeight: '600', color: '#2d3748' }}>Navigate to the SpreadLine-main directory</div>
                      </div>
                      <div style={{ marginLeft: '3rem', background: '#1a202c', color: '#a0aec0', padding: '0.75rem 1rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        cd /workspaces/spreadline2/SpreadLine-main
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div style={{ background: '#667eea', color: 'white', width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem', flexShrink: 0 }}>
                          2
                        </div>
                        <div style={{ fontWeight: '600', color: '#2d3748' }}>Run the test script</div>
                      </div>
                      <div style={{ marginLeft: '3rem', background: '#1a202c', color: '#a0aec0', padding: '0.75rem 1rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        python test_fetchspreadline.py
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div style={{ background: '#667eea', color: 'white', width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem', flexShrink: 0 }}>
                          3
                        </div>
                        <div style={{ fontWeight: '600', color: '#2d3748' }}>Check generated outputs</div>
                      </div>
                      <div style={{ marginLeft: '3rem', fontSize: '0.875rem', color: '#4a5568', lineHeight: '1.75' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#48bb78' }}>✓</span>
                          <div>
                            <code style={{ background: '#edf2f7', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                              /workspaces/spreadline2/fetchspreadline_trace.json
                            </code>
                            <div style={{ color: '#718096', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                              Complete trace log with all 24 transformation steps
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                          <span style={{ color: '#48bb78' }}>✓</span>
                          <div>
                            <code style={{ background: '#edf2f7', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                              /workspaces/spreadline2/fetchspreadline_result.json
                            </code>
                            <div style={{ color: '#718096', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                              Final endpoint response with all rendered data
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {[
                    { value: '24', label: 'Traced Steps', color: '#667eea' },
                    { value: '198', label: 'Storylines', color: '#48bb78' },
                    { value: '21', label: 'Time Steps', color: '#ed64a6' }
                  ].map((stat, i) => (
                    <div key={i} style={{ background: `${stat.color}15`, padding: '1.5rem', borderRadius: '12px', border: `2px solid ${stat.color}30`, textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: '0.875rem', color: '#4a5568', marginTop: '0.5rem' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>📚 Documentation Complete</h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '1rem' }}>
            This comprehensive documentation covers all aspects of the /fetchSpreadLine endpoint,
            including architecture, data flow, algorithms, and complete source code references.
          </p>
          <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>
            Generated: 2025-12-23 • Python Lines: 2,976 • Modules: 10 • Phases: 5
          </div>
        </div>
      </div>
    </div>
  );
}

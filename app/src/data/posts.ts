export interface Post {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  readingTime: string;
  content: string;
}

const slowProgrammingContent = [
  '# Slow Programming',
  '',
  'In a world obsessed with speed, I have become interested in the art of moving slowly. Not because I am inefficient, but because I have learned that some things cannot be rushed.',
  '',
  '> [!note]',
  '> This essay was inspired by a conversation with a colleague who bragged about shipping a feature in two hours. It took me three days to write this introduction.',
  '',
  '## The Cult of Velocity',
  '',
  'Modern software development worships at the altar of velocity. Story points, sprint velocities, lines of code per day — we have gamified the act of creation into a leaderboard of who can produce the most, the fastest.',
  '',
  'But what are we racing toward?',
  '',
  'Consider the [[Philosophy of Enough|philosophy of enough]] — the radical idea that software can be complete, that a system can reach a state where adding more is not just unnecessary but actively harmful. This concept is heresy in an industry that measures success by growth metrics.',
  '',
  '```typescript',
  '// Fast code: clever, compact, impenetrable',
  'const p=(a,b)=>a.reduce((c,d)=>c+((e,f)=>e?f(e-1,f):1)(d,((g,h)=>g?h(g-1,h):1)),0);',
  '',
  '// Slow code: readable, maintainable, kind to your future self',
  'function calculatePowerSum(numbers: number[]): number {',
  '  const factorial = (n: number): number => {',
  '    if (n <= 1) return 1;',
  '    return n * factorial(n - 1);',
  '  };',
  '',
  '  return numbers.reduce((sum, num) => {',
  '    return sum + factorial(num);',
  '  }, 0);',
  '}',
  '```',
  '',
  '## The Paradox of Understanding',
  '',
  'The more slowly I write, the faster my codebase evolves. This sounds contradictory, but the explanation is simple: when I write slowly, I understand deeply. When I understand deeply, I make fewer mistakes. When I make fewer mistakes, I spend less time debugging.',
  '',
  '> [!tip]',
  '> Try the "rubber duck" method before writing a single line of code. Explain your approach out loud to an inanimate object. If you cannot articulate it clearly, you do not understand it yet.',
  '',
  '### The Cost of Haste',
  '',
  'A study from the University of Cambridge found that the time spent fixing bugs increases exponentially with the speed at which the original code was written. Code written in a rush contains approximately 3.5x more defects per line than code written with deliberate care.',
  '',
  '| Speed | Defects per 1000 LOC | Debugging Time | Total Time |',
  '|-------|---------------------|----------------|------------|',
  '| Rushed | 15 | 40 hours | 60 hours |',
  '| Careful | 4 | 8 hours | 48 hours |',
  '| Deliberate | 2 | 3 hours | 51 hours |',
  '',
  '> [!warning]',
  '> The "careful" approach actually takes less total time than "rushed" — and produces vastly better results. Deliberate is slightly slower but yields the highest quality.',
  '',
  '## Practices for Slow Programming',
  '',
  'Here are techniques I have adopted that force me to slow down:',
  '',
  '1. **Read before writing.** Spend at least twenty minutes understanding the existing codebase before modifying it.',
  '2. **Write pseudocode first.** Sketch the algorithm in plain language before translating to code.',
  '3. **Commit frequently.** Every small, working increment gets its own commit with a descriptive message.',
  '4. **Sleep on it.** Never submit code for review at the end of a long session. Return to it fresh.',
  '5. **Review your own diff.** Read every changed line as if someone else wrote it.',
  '',
  '## The Garden Metaphor',
  '',
  'This website is called a "digital garden" for a reason. A garden does not grow on sprint cycles. You plant, you water, you wait. Some things sprout quickly. Others take seasons. The gardener who frantically digs up seeds to check their progress will never see a bloom.',
  '',
  'Software, too, is a living thing. It needs time to settle, to be observed, to reveal its true nature. The best systems I have built were not the ones I shipped fastest — they were the ones I lived with longest, tending carefully, pruning thoughtfully.',
  '',
  '---',
  '',
  '*The next time you feel pressure to ship, ask yourself: what would the slow version of this look like? You might be surprised by how much better it becomes.*',
  '',
  'Related: [[Building in Public]], [[The Architecture of Simplicity|simplicity in architecture]]',
].join('\n');

const philosophyOfEnoughContent = [
  '# The Philosophy of Enough',
  '',
  'We live in an age of infinite scalability, endless features, and perpetual growth. Every product roadmap stretches into eternity, every system design assumes ten-thousand-fold expansion, and every startup pitch promises to "change the world."',
  '',
  'But what if the most radical act of engineering is knowing when to stop?',
  '',
  '## Defining Enough',
  '',
  '"Enough" is not mediocrity. It is not settling for less than you could achieve. It is the precise calibration of scope to need — the elegant line where a solution solves the problem completely without solving problems that do not yet exist.',
  '',
  '> [!note]',
  '> The concept of "enough" comes from the Greek concept of *autarky* — self-sufficiency — and the Buddhist principle of *santosa*, contentment. Both teach that desire beyond need is the root of suffering.',
  '',
  '## The Anti-Pattern of Over-Engineering',
  '',
  'Over-engineering is not a failure of intelligence. It is a failure of restraint.',
  '',
  'Consider the classic case: a team builds a microservices architecture for a product with twelve users. They implement Kafka, Kubernetes, and a custom service mesh because "we need to be ready to scale." Six months later, the startup folds because they spent their runway on infrastructure instead of product-market fit.',
  '',
  '```yaml',
  '# Over-engineered deployment pipeline',
  'deploy:',
  '  strategy: blue-green',
  '  canary:',
  '    percentage: 5',
  '    analysis:',
  '      threshold: 5',
  '      interval: 5m',
  '  rollback:',
  '    automatic: true',
  '    conditions:',
  '      - error_rate > 0.01',
  '      - latency_p99 > 500ms',
  '```',
  '',
  '## The Minimum Virtuous Product',
  '',
  'We have all heard of the Minimum Viable Product. I propose a different standard: the **Minimum Virtuous Product** — the smallest thing you can build that genuinely helps someone.',
  '',
  'The difference is subtle but profound. "Viable" asks: what is the least we can get away with? "Virtuous" asks: what is the least that would truly matter?',
  '',
  '> [!tip]',
  '> Before adding any feature, write the user story that justifies it. Not a vague "as a user I want..." but a specific, named person facing a specific, real problem. If you cannot name the person, you do not need the feature.',
  '',
  '### The Virtue of Constraints',
  '',
  'Constraints are not obstacles. They are the frame that gives a painting its shape.',
  '',
  'Twitter started with a 140-character constraint that forced a new form of expression. Instagram launched without a website — mobile-only, deliberately. These constraints were not technical limitations; they were product decisions that created focus.',
  '',
  '## Applied Philosophy',
  '',
  'Here is how I apply the philosophy of enough to my own work:',
  '',
  '- **In code:** I stop refactoring when the code is readable, tested, and correct — not when it is "elegant" by some abstract standard.',
  '- **In systems:** I choose the simplest architecture that handles current load plus a modest safety margin, not the architecture that handles hypothetical future load.',
  '- **In features:** I aggressively delete features that fewer than 5% of users touch. Every deleted feature is a gift to your future self.',
  '- **In meetings:** I schedule 25-minute meetings instead of 30. The constraint forces focus.',
  '',
  '## When to Expand',
  '',
  'None of this means you should never grow. It means you should grow deliberately.',
  '',
  'Expansion is justified when:',
  '',
  '1. Current capacity is genuinely exhausted',
  '2. A new capability solves a problem users already have',
  '3. The cost of the expansion is less than the cost of the constraint',
  '',
  '> [!warning]',
  '> "Users might want this someday" is not justification. "Users are complaining about this today" is.',
  '',
  '## Conclusion',
  '',
  'The most beautiful code I have ever written was code I deleted. The most elegant system I ever designed was one I never had to build — because the simpler version was enough.',
  '',
  'Enough is not a destination. It is a practice. A daily choice to build what is needed, and no more. To trust that the future will be handled by future engineers, with their own tools and their own wisdom.',
  '',
  '---',
  '',
  '*Stop when it is done. That is the art.*',
  '',
  'Related: [[Slow Programming]], [[Building in Public]]',
].join('\n');

const buildingInPublicContent = [
  '# Building in Public',
  '',
  'There is a peculiar vulnerability in showing your work before it is finished. The instinct to hide, to polish, to present only the final product — it runs deep. But I have come to believe that building in public is not just a marketing strategy. It is a moral stance.',
  '',
  '## The Hidden Cost of Stealth',
  '',
  'Stealth mode feels safe. No one can criticize what they cannot see. No competitor can copy what they do not know exists. But safety has a cost: isolation.',
  '',
  'When you build in secret, you lose the most valuable resource an entrepreneur or creator can have: feedback. Not the polite feedback of friends and family, but the honest, sometimes brutal feedback of strangers who have no investment in your ego.',
  '',
  '> [!note]',
  '> I started this blog when my previous project was still half-built. The first post had twelve readers. Three of them became beta testers who identified critical flaws I had missed.',
  '',
  '## What Building in Public Actually Means',
  '',
  'It does not mean sharing everything. It does not mean live-streaming your API keys or publishing your financial spreadsheets. It means sharing the *process* — the decisions, the trade-offs, the mistakes, the pivots.',
  '',
  '### The Transparency Spectrum',
  '',
  '| Level | What You Share | Audience | Risk | Reward |',
  '|-------|---------------|----------|------|--------|',
  '| Silent | Nothing | None | High (isolation) | None |',
  '| Selective | Wins only | Friends | Medium | Validation |',
  '| Curated | Wins + some failures | Followers | Low-Medium | Trust |',
  '| Transparent | Process + finances + failures | Public | Low | Loyalty |',
  '| Radical | Everything in real-time | Everyone | Variable | Community |',
  '',
  'I operate somewhere between "Transparent" and "Radical." I share revenue numbers, failed experiments, and design decisions in progress. I do not share personal conflicts or proprietary partner details.',
  '',
  '## The Unexpected Benefits',
  '',
  'Building in public has brought benefits I never anticipated:',
  '',
  '1. **Recruitment.** The best engineers I have hired found me through my writing. They already knew how I thought before the interview.',
  '2. **Partnerships.** Companies I admired reached out because they saw the quality of my thinking, not just my product.',
  '3. **Resilience.** Public accountability makes it harder to quit. Not because of shame, but because of the community that roots for you.',
  '4. **Clarity.** Writing about your work forces you to understand it. If you cannot explain it simply, you do not understand it well enough.',
  '',
  '> [!tip]',
  '> Start small. Share one thing per week. A screenshot, a lesson learned, a number. Consistency beats intensity.',
  '',
  '## Handling the Negativity',
  '',
  'Not everyone will cheer. Some people will mock your metrics, question your choices, or predict your failure. This is the price of visibility, and it is worth paying.',
  '',
  '```javascript',
  '// The filter I apply to criticism:',
  'function processFeedback(comment) {',
  '  if (comment.isConstructive) {',
  '    return integrate(comment.suggestion);',
  '  }',
  '  if (comment.isMean && comment.hasNoSubstance) {',
  '    return discard(comment); // Not all voices deserve attention',
  '  }',
  '  if (comment.isMean && comment.hasSubstance) {',
  '    return extractWisdom(comment); // Sometimes truth is bitter',
  '  }',
  '}',
  '```',
  '',
  '## My Public Building Stack',
  '',
  'The tools I use to build in public:',
  '',
  '- **This blog** — long-form thinking, essays, deep dives',
  '- **Twitter/X** — quick thoughts, progress updates, community',
  '- **GitHub** — code, of course, but also issues and discussions',
  '- **Newsletter** — monthly retrospectives with real numbers',
  '',
  '## Conclusion',
  '',
  'Building in public is an act of generosity. You are giving the world your process, your mistakes, your evolution. In return, you receive something far more valuable than secrecy could ever protect: a community that cares.',
  '',
  'Start before you are ready. Share before it is perfect. The imperfect thing that exists is infinitely more valuable than the perfect thing that does not.',
  '',
  '---',
  '',
  '*What are you working on that you have been afraid to share?*',
  '',
  'Related: [[The Philosophy of Enough]], [[Slow Programming]]',
].join('\n');

const architectureOfSimplicityContent = [
  '# The Architecture of Simplicity',
  '',
  'Software architecture is often discussed in terms of scale. How many requests per second? How many nodes in the cluster? How many microservices in the mesh?',
  '',
  'I want to talk about architecture in terms of simplicity. Not because scale does not matter, but because simplicity is the only thing that actually scales.',
  '',
  '## The Simplicity Principle',
  '',
  '> [!note]',
  '> "Simplicity is the ultimate sophistication." — Leonardo da Vinci, who would have been a terrible software engineer by modern hiring standards.',
  '',
  'Complexity is the enemy. It accumulates quietly, like dust on a shelf, until one day you realize you cannot see the object anymore. Every abstraction layer, every configuration flag, every conditional branch adds cognitive load.',
  '',
  'The measure of good architecture is not how many problems it solves. It is how few problems it creates while solving the ones that matter.',
  '',
  '## Case Study: The Monolith That Outperformed Microservices',
  '',
  'I once worked on a team that spent six months decomposing a monolith into microservices. The result was a system with forty-three services, a custom service discovery layer, and a deployment pipeline so complex it required a dedicated team.',
  '',
  'Latency went up. Availability went down. Developer productivity plummeted.',
  '',
  'Two years later, the company quietly merged most of those services back together. The final architecture was simpler than the original monolith — not because microservices are bad, but because they had been applied as a default rather than a deliberate choice.',
  '',
  '```python',
  '# Simple, direct, obvious:',
  'def get_user(user_id: int) -> User:',
  '    return db.users.find_by_id(user_id)',
  '',
  '# Complex, indirect, clever:',
  'def get_user(user_id: int) -> User:',
  '    cache_key = f"user:{hash(user_id)}"',
  '    if cached := redis.get(cache_key):',
  '        return User.deserialize(cached)',
  '    if shard := shard_router.route(user_id):',
  '        user = shard.query(f"SELECT * FROM users WHERE id = {user_id}")',
  '        redis.setex(cache_key, 300, user.serialize())',
  '        return user',
  '    raise ServiceUnavailable()',
  '```',
  '',
  'The first version is better until you have evidence that caching and sharding are necessary. Premature optimization is not just the root of all evil — it is the root of all unnecessary complexity.',
  '',
  '## The Rule of Three',
  '',
  'I follow a simple heuristic:',
  '',
  '> [!tip]',
  '> Do not add an abstraction until you have three concrete examples that would benefit from it. One example is a coincidence. Two is a pattern. Three is justification.',
  '',
  'This applies to everything:',
  '',
  '- **Components:** Do not extract a shared component until three files need it.',
  '- **Utilities:** Do not create a utility library until three functions repeat the same logic.',
  '- **Services:** Do not create a new service until three parts of the system need its capability independently.',
  '',
  'The discipline of waiting creates better abstractions. When you finally extract, the pattern is clear and the solution is obvious.',
  '',
  '## Simplicity in Practice',
  '',
  '### Fewer Files, Deeper Understanding',
  '',
  'I prefer fewer, larger files over many small ones until the size becomes genuinely unmanageable. A single file of 500 well-organized lines is easier to understand than ten files of 50 lines each with complex import relationships.',
  '',
  '### Explicit over Implicit',
  '',
  'Magic is seductive. Dependency injection frameworks, auto-wiring, convention-over-configuration — they promise to save typing. But the cost is opacity. When something breaks, you are debugging the framework, not your code.',
  '',
  '```typescript',
  '// Explicit: verbose but transparent',
  'const database = new PostgresDatabase({',
  '  host: process.env.DB_HOST,',
  '  port: parseInt(process.env.DB_PORT, 10),',
  '  ssl: process.env.NODE_ENV === "production",',
  '});',
  '',
  '// Implicit: concise but opaque',
  'const database = container.resolve(Database); // Where did this come from?',
  '```',
  '',
  '### State Management: The Heart of Complexity',
  '',
  'The most complex part of any system is state. Where it lives, how it flows, when it updates. My rule: keep state as close to where it is used as possible.',
  '',
  '| State Location | Use Case | Complexity |',
  '|--------------|----------|------------|',
  '| Component local | UI-only, ephemeral | Low |',
  '| URL params | Shareable, bookmarkable | Low-Medium |',
  '| Module scope | Feature-level shared | Medium |',
  '| Global store | Truly global, many consumers | High |',
  '| Database | Persistent, authoritative | High |',
  '',
  '> [!warning]',
  '> Do not reach for Redux or Zustand when `useState` would suffice. Global state should be the exception, not the default.',
  '',
  '## The Aesthetic Dimension',
  '',
  'There is an aesthetic quality to simple code. It feels clean, like a well-designed room. You can see all the walls. Nothing is hidden. Every element earns its place.',
  '',
  'This is not minimalism for its own sake. It is minimalism as a service to the reader. The person reading your code in six months — possibly you — deserves clarity.',
  '',
  '---',
  '',
  '*The best architecture is the one that disappears. You stop noticing it because it works so well. That is the goal: to build systems so simple they become invisible.*',
  '',
  'Related: [[Slow Programming]], [[The Philosophy of Enough|the philosophy of enough]]',
].join('\n');

function loadSavedPosts(): Record<string, Partial<Post>> {
  try {
    const saved = localStorage.getItem('vibecoding_posts')
    if (!saved) return {}
    const parsed = JSON.parse(saved) as Record<string, Partial<Post>>
    // 自动清理损坏的数据（缺少 content 字段）
    let hasCorrupt = false
    for (const [slug, data] of Object.entries(parsed)) {
      if (!data.content || typeof data.content !== 'string') {
        delete parsed[slug]
        hasCorrupt = true
      }
    }
    if (hasCorrupt) {
      localStorage.setItem('vibecoding_posts', JSON.stringify(parsed))
    }
    return parsed
  } catch {
    localStorage.removeItem('vibecoding_posts')
    return {}
  }
}

function mergeSavedPosts(basePosts: Post[]): Post[] {
  const saved = loadSavedPosts()
  return basePosts.map((post) => {
    if (saved[post.slug]) {
      return { ...post, ...saved[post.slug] }
    }
    return post
  })
}

let _posts: Post[] = mergeSavedPosts([
  {
    slug: 'slow-programming',
    title: 'Slow Programming',
    date: '2025-04-15',
    category: 'Development',
    tags: ['mindfulness', 'craft', 'typescript', 'software-design'],
    excerpt:
      'In a world obsessed with speed, I have become interested in the art of moving slowly. Not because I am inefficient, but because I have learned that some things cannot be rushed.',
    readingTime: '8 min read',
    content: slowProgrammingContent,
  },
  {
    slug: 'philosophy-of-enough',
    title: 'The Philosophy of Enough',
    date: '2025-03-22',
    category: 'Reflections',
    tags: ['minimalism', 'product-management', 'startups', 'philosophy'],
    excerpt:
      'What if the most radical act of engineering is knowing when to stop? Exploring the virtue of restraint in an industry addicted to growth.',
    readingTime: '6 min read',
    content: philosophyOfEnoughContent,
  },
  {
    slug: 'building-in-public',
    title: 'Building in Public',
    date: '2025-02-10',
    category: 'Thoughts',
    tags: ['transparency', 'community', 'indie-hacking', 'writing'],
    excerpt:
      'There is a peculiar vulnerability in showing your work before it is finished. Building in public is not just a marketing strategy — it is a moral stance.',
    readingTime: '7 min read',
    content: buildingInPublicContent,
  },
  {
    slug: 'the-architecture-of-simplicity',
    title: 'The Architecture of Simplicity',
    date: '2025-01-08',
    category: 'Tutorial',
    tags: ['architecture', 'simplicity', 'clean-code', 'refactoring'],
    excerpt:
      'Software architecture is often discussed in terms of scale. But I want to talk about architecture in terms of simplicity — because simplicity is the only thing that actually scales.',
    readingTime: '9 min read',
    content: architectureOfSimplicityContent,
  },
]);

export const posts = _posts;

export function addPost(post: Post): void {
  _posts.unshift(post);
  const saved = loadSavedPosts();
  saved[post.slug] = post;
  localStorage.setItem('vibecoding_posts', JSON.stringify(saved));
}

export function savePost(slug: string, updates: Partial<Post>): void {
  const idx = _posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return;
  _posts[idx] = { ..._posts[idx], ...updates };
  const saved = loadSavedPosts();
  saved[slug] = { ...saved[slug], ...updates };
  localStorage.setItem('vibecoding_posts', JSON.stringify(saved));
}

export function getPostBySlug(slug: string): Post | undefined {
  return _posts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return _posts.map((p) => p.slug);
}

export function getAdjacentPosts(slug: string): {
  prev: Post | null;
  next: Post | null;
} {
  const idx = _posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx < _posts.length - 1 ? _posts[idx + 1] : null,
    next: idx > 0 ? _posts[idx - 1] : null,
  };
}

export function getRelatedPosts(slug: string, limit = 3): Post[] {
  const current = getPostBySlug(slug);
  if (!current) return [];

  const scored = _posts
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0;
      if (p.category === current.category) score += 3;
      const sharedTags = p.tags.filter((t) => current.tags.includes(t));
      score += sharedTags.length * 2;
      const dateDiff = Math.abs(
        new Date(p.date).getTime() - new Date(current.date).getTime()
      );
      score += Math.max(0, 1 - dateDiff / (1000 * 60 * 60 * 24 * 365));
      return { post: p, score };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.post);
}

export function getCategories(): string[] {
  const cats = new Set(_posts.map((p) => p.category));
  return ['All', ...Array.from(cats)];
}

export function searchPosts(query: string): Post[] {
  const q = query.toLowerCase();
  return _posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
  );
}

export function getPostsByCategory(category: string): Post[] {
  if (category === 'All') return _posts;
  return _posts.filter((p) => p.category === category);
}

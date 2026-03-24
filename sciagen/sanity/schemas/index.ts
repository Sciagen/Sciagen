// ─────────────────────────────────────────────────────────────────────────────
// SANITY SCHEMAS — Complete CMS schema definitions
// ─────────────────────────────────────────────────────────────────────────────

// ── Author Schema ─────────────────────────────────────────────────────────────
export const authorSchema = {
  name:  'author',
  title: 'Author',
  type:  'document',
  fields: [
    { name: 'name',        title: 'Full Name',    type: 'string',  validation: (R: { required: () => unknown }) => R.required() },
    { name: 'slug',        title: 'Slug',         type: 'slug',    options: { source: 'name' }, validation: (R: { required: () => unknown }) => R.required() },
    { name: 'bio',         title: 'Biography',    type: 'text',    rows: 4 },
    { name: 'credentials', title: 'Credentials',  type: 'string',  description: 'e.g. PhD, MD, MSc' },
    { name: 'photo',       title: 'Photo',        type: 'image',   options: { hotspot: true } },
    {
      name: 'social', title: 'Social Links', type: 'object',
      fields: [
        { name: 'twitter',  title: 'Twitter URL',  type: 'url' },
        { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
        { name: 'website',  title: 'Website URL',  type: 'url' },
      ],
    },
  ],
  preview: {
    select: { title: 'name', media: 'photo' },
  },
};

// ── Category Schema ───────────────────────────────────────────────────────────
export const categorySchema = {
  name:  'category',
  title: 'Category',
  type:  'document',
  fields: [
    { name: 'name',        title: 'Name',        type: 'string', validation: (R: { required: () => unknown }) => R.required() },
    { name: 'slug',        title: 'Slug',        type: 'slug',   options: { source: 'name' }, validation: (R: { required: () => unknown }) => R.required() },
    { name: 'description', title: 'Description', type: 'text', rows: 2 },
    {
      name:    'domain',
      title:   'Science Domain',
      type:    'string',
      options: {
        list: [
          { value: 'ai',          title: 'Artificial Intelligence' },
          { value: 'healthcare',  title: 'Healthcare & Medicine'   },
          { value: 'physics',     title: 'Physics'                 },
          { value: 'biology',     title: 'Biology'                 },
          { value: 'space',       title: 'Space & Astronomy'       },
          { value: 'technology',  title: 'Technology'              },
          { value: 'chemistry',   title: 'Chemistry'               },
          { value: 'neuroscience',title: 'Neuroscience'            },
          { value: 'environment', title: 'Environment'             },
          { value: 'genomics',    title: 'Genomics'                },
          { value: 'quantum',     title: 'Quantum Science'         },
          { value: 'energy',      title: 'Energy'                  },
          { value: 'mathematics', title: 'Mathematics'             },
          { value: 'psychology',  title: 'Psychology'              },
          { value: 'materials',   title: 'Materials Science'       },
          { value: 'business',    title: 'Business & Science'      },
        ],
      },
      validation: (R: { required: () => unknown }) => R.required(),
    },
    { name: 'color', title: 'Accent Color (hex)', type: 'string', description: 'e.g. #06d0f5' },
    { name: 'icon',  title: 'Icon Name',          type: 'string', description: 'Lucide icon name' },
  ],
};

// ── Tag Schema ────────────────────────────────────────────────────────────────
export const tagSchema = {
  name:  'tag',
  title: 'Tag',
  type:  'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (R: { required: () => unknown }) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug',   options: { source: 'name' } },
  ],
};

// ── Article Schema ────────────────────────────────────────────────────────────
export const articleSchema = {
  name:  'article',
  title: 'Article',
  type:  'document',
  orderings: [
    { title: 'Publish Date (Newest)', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
    { title: 'Publish Date (Oldest)', name: 'publishedAtAsc',  by: [{ field: 'publishedAt', direction: 'asc'  }] },
  ],
  fields: [
    // ── Core
    {
      name:       'title',
      title:      'Title',
      type:       'string',
      validation: (R: { required: () => { max: (n: number) => unknown } }) => R.required().max(160),
    },
    {
      name:       'slug',
      title:      'Slug',
      type:       'slug',
      options:    { source: 'title', maxLength: 96 },
      validation: (R: { required: () => unknown }) => R.required(),
    },
    {
      name:       'description',
      title:      'Description / Subtitle',
      type:       'text',
      rows:       3,
      validation: (R: { required: () => { max: (n: number) => unknown } }) => R.required().max(300),
    },
    {
      name:    'summary',
      title:   'AI-Generated Summary',
      type:    'text',
      rows:    3,
      description: 'Auto-generated by AI or manually entered (max 100 words)',
    },

    // ── Media
    {
      name:    'mainImage',
      title:   'Main Image',
      type:    'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt',     title: 'Alt Text',    type: 'string' },
        { name: 'caption', title: 'Caption',     type: 'string' },
      ],
    },

    // ── Body
    {
      name:  'body',
      title: 'Article Body',
      type:  'array',
      of: [
        {
          type:  'block',
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Italic', value: 'em'     },
              { title: 'Code',   value: 'code'   },
              { title: 'Strike', value: 'strike-through' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name:   'link',
                type:   'object',
                title:  'Link',
                fields: [
                  { name: 'href',   type: 'url',     title: 'URL'   },
                  { name: 'blank',  type: 'boolean', title: 'Open in new tab', initialValue: true },
                ],
              },
            ],
          },
          styles: [
            { title: 'Normal',       value: 'normal' },
            { title: 'H2',           value: 'h2'     },
            { title: 'H3',           value: 'h3'     },
            { title: 'H4',           value: 'h4'     },
            { title: 'Quote',        value: 'blockquote' },
            { title: 'Key Finding',  value: 'keyFinding' },
          ],
        },
        {
          type:  'image',
          fields: [
            { name: 'alt',     title: 'Alt Text', type: 'string' },
            { name: 'caption', title: 'Caption',  type: 'string' },
          ],
          options: { hotspot: true },
        },
        {
          type:  'object',
          name:  'callout',
          title: 'Callout Box',
          fields: [
            {
              name:    'type',
              type:    'string',
              options: { list: ['info', 'warning', 'success', 'research'] },
              initialValue: 'info',
            },
            { name: 'title', type: 'string' },
            { name: 'body',  type: 'text', rows: 3 },
          ],
        },
        {
          type:  'object',
          name:  'dataTable',
          title: 'Data Table',
          fields: [
            { name: 'caption', type: 'string', title: 'Table Caption' },
            { name: 'rows',    type: 'array',  title: 'Rows', of: [{ type: 'string' }] },
          ],
        },
      ],
    },

    // ── Classification
    { name: 'domain',   title: 'Science Domain', type: 'string', options: { list: ['ai','healthcare','physics','biology','space','technology','chemistry','neuroscience','environment','genomics','quantum','energy','mathematics','psychology','materials','business'] } },
    { name: 'category', title: 'Category',       type: 'reference', to: [{ type: 'category' }] },
    { name: 'tags',     title: 'Tags',            type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] },
    { name: 'author',   title: 'Author',          type: 'reference', to: [{ type: 'author' }] },
    { name: 'related',  title: 'Related Articles',type: 'array', of: [{ type: 'reference', to: [{ type: 'article' }] }] },

    // ── Source
    { name: 'source',     title: 'Content Source', type: 'string', options: { list: ['editorial','aggregated','research'] }, initialValue: 'editorial' },
    { name: 'sourceUrl',  title: 'Source URL',      type: 'url' },
    { name: 'sourceName', title: 'Source Name',     type: 'string' },

    // ── Publishing
    {
      name:    'status',
      title:   'Status',
      type:    'string',
      options: { list: ['draft','published','scheduled','archived'], layout: 'radio' },
      initialValue: 'draft',
    },
    { name: 'publishedAt',   title: 'Published At',  type: 'datetime' },
    { name: 'scheduledAt',   title: 'Scheduled For', type: 'datetime' },

    // ── Flags
    { name: 'isFeatured', title: 'Featured',  type: 'boolean', initialValue: false },
    { name: 'isPremium',  title: 'Premium',   type: 'boolean', initialValue: false },
    { name: 'isBreaking', title: 'Breaking',  type: 'boolean', initialValue: false },

    // ── Stats (managed programmatically)
    { name: 'readingTime', title: 'Reading Time (mins)', type: 'number' },
    { name: 'wordCount',   title: 'Word Count',          type: 'number' },
    { name: 'viewCount',   title: 'View Count',          type: 'number', readOnly: true, initialValue: 0 },
    { name: 'shareCount',  title: 'Share Count',         type: 'number', readOnly: true, initialValue: 0 },

    // ── SEO
    {
      name:  'seo',
      title: 'SEO',
      type:  'object',
      fields: [
        { name: 'metaTitle',       title: 'Meta Title',       type: 'string',   validation: (R: { max: (n: number) => unknown }) => R.max(60) },
        { name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2, validation: (R: { max: (n: number) => unknown }) => R.max(160) },
        { name: 'ogImage',         title: 'OG Image',         type: 'image'  },
        { name: 'keywords',        title: 'Keywords',         type: 'array', of: [{ type: 'string' }] },
        { name: 'canonicalUrl',    title: 'Canonical URL',    type: 'url'    },
      ],
    },
  ],

  preview: {
    select: {
      title:    'title',
      author:   'author.name',
      media:    'mainImage',
      status:   'status',
      domain:   'domain',
    },
    prepare({ title, author, media, status, domain }: Record<string, string>) {
      return {
        title,
        subtitle: `${status?.toUpperCase()} · ${domain} · ${author ?? 'Unknown author'}`,
        media,
      };
    },
  },
};

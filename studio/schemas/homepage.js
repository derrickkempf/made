export default {
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    {name: 'heroHeading', title: 'Hero heading', type: 'text', rows: 3},
    {name: 'heroCtaLabel', title: 'Hero button label', type: 'string'},
    {
      name: 'newReleases',
      title: 'New releases (4 products)',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      validation: (r) => r.max(4),
    },
    {
      name: 'features',
      title: 'Feature sections (in page order)',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'eyebrow', title: 'Eyebrow label', type: 'string'},
          {name: 'heading', title: 'Heading (optional)', type: 'string'},
          {name: 'body', title: 'Body / statement', type: 'text', rows: 4},
          {name: 'ctaLabel', title: 'Button label', type: 'string'},
        ],
        preview: {select: {title: 'eyebrow', subtitle: 'heading'}},
      }],
    },
  ],
  preview: {prepare: () => ({title: 'Homepage'})},
}

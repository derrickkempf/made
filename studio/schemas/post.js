export default {
  name: 'post',
  title: 'Research post',
  type: 'document',
  fields: [
    {name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()},
    {name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3},
    {name: 'image', title: 'Image', type: 'image', options: {hotspot: true}},
  ],
}

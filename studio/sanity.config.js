import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'MADE artes',
  projectId: 'YOUR_PROJECT_ID', // ← from sanity.io/manage
  dataset: 'production',
  plugins: [structureTool()],
  schema: {types: schemaTypes},
})

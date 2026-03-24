import { defineConfig } from 'sanity';
import { deskTool }     from 'sanity/desk';
import { visionTool }   from '@sanity/vision';
import { media }        from 'sanity-plugin-media';
import { colorInput }   from '@sanity/color-input';
import {
  articleSchema,
  authorSchema,
  categorySchema,
  tagSchema,
} from './sanity/schemas';

export default defineConfig({
  name:      'sciagen-studio',
  title:     'Sciagen CMS',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  basePath:  '/studio',

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Sciagen Content')
          .items([
            S.listItem()
              .title('📰 Articles')
              .child(
                S.list()
                  .title('Articles by Status')
                  .items([
                    S.listItem().title('✅ Published').child(
                      S.documentList().title('Published').filter('_type == "article" && status == "published"').defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                    ),
                    S.listItem().title('📝 Drafts').child(
                      S.documentList().title('Drafts').filter('_type == "article" && status == "draft"')
                    ),
                    S.listItem().title('🗓 Scheduled').child(
                      S.documentList().title('Scheduled').filter('_type == "article" && status == "scheduled"')
                    ),
                    S.listItem().title('⭐ Featured').child(
                      S.documentList().title('Featured').filter('_type == "article" && isFeatured == true')
                    ),
                    S.divider(),
                    S.listItem().title('All Articles').child(
                      S.documentList().title('All Articles').filter('_type == "article"').defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                    ),
                  ])
              ),
            S.listItem().title('👥 Authors').child(S.documentList().title('Authors').filter('_type == "author"')),
            S.listItem().title('🏷 Categories').child(S.documentList().title('Categories').filter('_type == "category"')),
            S.listItem().title('🔖 Tags').child(S.documentList().title('Tags').filter('_type == "tag"')),
          ]),
    }),
    visionTool(),
    media(),
    colorInput(),
  ],

  schema: {
    types: [articleSchema, authorSchema, categorySchema, tagSchema],
  },
});

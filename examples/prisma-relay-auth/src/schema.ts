import { builder } from './builder';
import { db } from './db';

builder.prismaNode('User', {
  findUnique: (id) => ({ id: Number.parseInt(id, 10) }),
  id: { resolve: (user) => user.id },
  fields: (t) => ({
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName'),
    fullName: t.string({
      resolve: (user) => `${user.firstName} ${user.lastName}`,
    }),
    posts: t.relation('posts'),
    comments: t.relatedConnection('comments', { cursor: 'id' }),
  }),
});

builder.prismaNode('Post', {
  id: { resolve: (post) => post.id },
  findUnique: (id) => ({ id: Number.parseInt(id, 10) }),
  grantScopes: (parent, context) => {
    console.log({ parent });
    console.log({ context });

    if (parent.authorId === context.user.id) {
      return ['readPrivateNotes'];
    }
    return [];
  },
  fields: (t) => ({
    title: t.exposeString('title'),
    content: t.exposeString('content'),
    author: t.relation('author'),
    comments: t.relation('comments'),
    privateNotes: t.exposeString('privateNotes', {
      authScopes: {
        $granted: 'readPrivateNotes',
      },
    }),
  }),
});

builder.prismaNode('Comment', {
  findUnique: (id) => ({ id: Number.parseInt(id, 10) }),
  id: { resolve: (post) => post.id },
  fields: (t) => ({
    comment: t.exposeString('comment'),
    author: t.relation('author'),
    post: t.relation('post'),
  }),
});

builder.queryType({
  fields: (t) => ({
    post: t.prismaField({
      type: 'Post',
      nullable: true,
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: (query, root, args) =>
        db.post.findUnique({
          ...query,
          where: { id: Number.parseInt(String(args.id), 10) },
        }),
    }),
    posts: t.prismaConnection({
      type: 'Post',
      cursor: 'id',
      resolve: (query) =>
        db.post.findMany({
          ...query,
        }),
    }),
    user: t.prismaField({
      type: 'User',
      nullable: true,
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: (query, root, args) =>
        db.user.findUnique({
          ...query,
          where: { id: Number.parseInt(String(args.id), 10) },
        }),
    }),
  }),
});

export const schema = builder.toSchema({});

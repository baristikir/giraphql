import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import RelayPlugin from '@pothos/plugin-relay';
import AuthPlugin from '@pothos/plugin-scope-auth';
import type PrismaTypes from '../prisma/generated';
import { db } from './db';

interface UserContext {
  user: {
    pk: number;
    name: string;
  };
}

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: UserContext;
  AuthScopes: {
    user: boolean;
  };
}>({
  plugins: [PrismaPlugin, AuthPlugin, RelayPlugin],
  relayOptions: {},
  authScopes: async ({ user }) => ({
    user: !!user,
  }),
  prisma: {
    client: db,
  },
});

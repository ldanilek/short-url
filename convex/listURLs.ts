import { PaginationOptions } from 'convex/server';
import { Document } from './_generated/dataModel';
import { query } from './_generated/server'

export default query(async ({ db, auth }, opts: PaginationOptions) => {
  const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to listURLs");
    }
    const user = await db
      .query("users")
      .withIndex("by_token", q =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  return await db
    .query('urls').withIndex('by_author', q => q.eq('author', user._id))
    .order('desc')
    .paginate(opts);
})

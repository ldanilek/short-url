import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(
  async ({ db, auth }, short: string) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to createURL");
    }
    const user = await db
      .query("users")
      .withIndex("by_token", q =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    const urlDoc = await db.query('urls')
      .withIndex('by_short', q => q.eq('short', short)).first();
    if (!urlDoc) {
      throw new Error('url not found');
    }
    if (!urlDoc.author.equals(user._id)) {
      throw new Error("can't delete a url you didn't create");
    }
    await db.delete(urlDoc._id);
  }
)

import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(
  async ({ db, auth }, url: string, short: string) => {
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
    await db.insert('urls', {
      short,
      url,
      author: user._id,
    });
  }
)

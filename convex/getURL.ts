import { query } from './_generated/server'

export default query(async ({ db }, short: string): Promise<string> => {
  const urlDoc = await db
    .query('urls')
    .filter((q) => q.eq(q.field('short'), short))
    .first();
  if (urlDoc === null) {
    return "";
  }
  return urlDoc.url;
})

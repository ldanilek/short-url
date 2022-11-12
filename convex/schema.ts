import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  urls: defineTable({
    short: s.string(),
    url: s.string(),
    author: s.id("users"),
  })
  .index('by_short', ['short'])
  .index('by_author', ['author']),
  users: defineTable({
    name: s.string(),
    tokenIdentifier: s.string(),
  }).index("by_token", ["tokenIdentifier"]),
});

import { Id } from './_generated/dataModel'
import { DatabaseReader, mutation } from './_generated/server';
import jsSHA from 'jssha';

/*
// copied from stackoverflow but it doesn't work because of UDF limitations.
async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);                    

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string                  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
*/

const randomChar = (): string => {
  return String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 26));
}

// given adjacent occupied shorts, return an available short strictly in between.
const availableShortBetween = (lower: string, upper: string): string => {
  let i = 0;
  for (; i < lower.length && i < upper.length; i++) {
    if (lower.charCodeAt(i) !== upper.charCodeAt(i)) {
      break;
    }
  }
  const commonPrefix = lower.slice(0, i);
  let lowerChar = i < lower.length ? lower.charCodeAt(i) : 0;
  let upperChar = upper.charCodeAt(i);
  // make the bounds nice ASCII if possible
  const niceLower = 'A'.charCodeAt(0);
  if (upperChar > niceLower) {
    lowerChar = Math.max(lowerChar, niceLower);
  }
  const niceUpper = 'z'.charCodeAt(0);
  if (lowerChar < niceUpper) {
    upperChar = Math.min(upperChar, niceUpper);
  }
  // lowerChar <= intermediateCharacter < upperChar
  const intermediateCharacter = String.fromCharCode(Math.floor((lowerChar + upperChar) / 2));
  return commonPrefix + intermediateCharacter + randomChar();
};

const availableShort = (occupied: string[]): string => {
  if (occupied.length === 0) {
    // no shorts at all. anything is fine.
    return randomChar();
  }
  if (occupied.length === 1) {
    let random = randomChar();
    while (occupied[0] === random) {
      random = randomChar();
    }
    return random;
  }
  const pairIndex = Math.floor(Math.random() * (occupied.length - 1));
  return availableShortBetween(occupied[pairIndex], occupied[pairIndex + 1]);
};

const generateShort = async (url: string, db: DatabaseReader): Promise<string> => {
  const shaObj = new jsSHA('SHA3-256', 'TEXT', {encoding: 'UTF8'});
  shaObj.update(url);
  const hash = shaObj.getHash('B64');
  const urlDocsBefore = await db.query('urls').withIndex('by_short', q => q.lt('short', hash)).order('desc').take(10);
  const urlDocsAfter = await db.query('urls').withIndex('by_short', q => q.gte('short', hash)).order('asc').take(10);
  const occupiedShorts = [...urlDocsBefore.reverse(), ...urlDocsAfter].map((d) => d.short);
  return availableShort(occupiedShorts);
}

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

    if (!short) {
      short = await generateShort(url, db);
    }

    const existingURL = await db.query('urls').withIndex('by_short', q => q.eq('short', short)).first();
    if (existingURL) {
      throw new Error('url with this short already exists');
    }

    await db.insert('urls', {
      short,
      url,
      author: user._id,
    });
  }
)

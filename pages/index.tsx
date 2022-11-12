import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useQuery, useMutation, usePaginatedQuery } from '../convex/_generated/react'
import { useCallback, useState, useEffect } from 'react'
import { useAuth0 } from "@auth0/auth0-react";


function Logout() {
  const { logout, user } = useAuth0();
  return (
    <div className={styles.section}>
      {/* We know this component only renders if the user is logged in. */}
      <p>Logged in{user!.name ? ` as ${user!.name}` : ""}</p>
      <button
        className={styles.button}
        onClick={() => logout({ returnTo: window.location.origin })}
      >
        Log out
      </button>
    </div>
  );
}

const CreateNewShortcut = () => {
  const createURL = useMutation('createURL');

  const [url, setURL] = useState('');
  const [short, setShort] = useState('');

  return <div className={styles.section}>
          <h2>Create new shortcut</h2>
        <input type="text" placeholder="url" value={url} onChange={(e) => setURL(e.target.value)} />
        <input type="text" placeholder="short" value={short} onChange={(e) => setShort(e.target.value)} />
        <button className={styles.button} onClick={async () => {
          await createURL(url, short);
          setURL('');
          setShort('');
        }}>
          Save Shortened URL
        </button>
        </div>;
}

const ListURLs = () => {
  const { results, status, loadMore } = usePaginatedQuery('listURLs', {
    initialNumItems: 5,
  });
  const deleteURL = useMutation('deleteURL');
  const loadMoreButton = (status !== 'Exhausted' ?
    <button className={styles.button}
      disabled={status === 'LoadingMore'}
      onClick={() => {
        if (status === 'CanLoadMore') { loadMore(5) }
      }}
    >Load More</button>
    : null);

  return <div className={styles.section}>
      <table className={styles.table}>
    <thead>
          <tr>
            <th>Short</th>
            <th>URL</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
        {
          results.map((u) => <tr key={u.short}>
            <td><a href={`${window.location.origin}/${u.short}`}>{u.short}</a></td>
            <td>{u.url}</td>
            <td><button onClick={() => deleteURL(u.short)}>Delete</button></td>
          </tr>)
        }
        </tbody>
        </table>
        {loadMoreButton}
        </div>;
}

const Home: NextPage = () => {
  const storeUser = useMutation("storeUser");

  useEffect(() => {
    async function createUser() {
      await storeUser();
    }
    createUser();
  }, [storeUser]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Short URL</title>
        <meta name="description" content="URL Shortener with Convex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Your URLs
        </h1>
        <Logout />
        <CreateNewShortcut />

        <ListURLs />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://www.convex.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/convex.svg" alt="Convex Logo" width={90} height={18} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home

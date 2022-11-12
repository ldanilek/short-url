import { useRouter } from 'next/router'
import { useEffect } from 'react';
import { useQuery, useMutation } from '../convex/_generated/react'

const Short = () => {
  const router = useRouter();
  const { short } = router.query;
  const shortStr = typeof short === 'string' ? short : '';
  const url = useQuery('getURL', shortStr) ?? '';

  useEffect(() => {
    if (url) {
        router.push(url);
    }
  }, [url])

  // TODO: redirect server-side by fetching the url in getServerSideProps.
  return <p>Loading {short}...</p>
}

export default Short

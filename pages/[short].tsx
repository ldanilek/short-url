import { useRouter } from 'next/router'
import { useEffect } from 'react';
import { useQuery, useMutation } from '../convex/_generated/react'
import clientConfig from '../convex/_generated/clientConfig'
import { ConvexHttpClient } from 'convex/browser';
import { API } from '../convex/_generated/api';
import { GetServerSideProps } from 'next';

const Short = () => {
  const router = useRouter();
  const { short } = router.query;
  return <p>Failed to redirect to {short}</p>
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {
  if (!req.url) {
    return {props: {}};
  }
  const convexClient = new ConvexHttpClient<API>(clientConfig);
  // remove leading slash
  const short = req.url!.slice(1);

  const url = await convexClient.query('getURL')(short);
  return {
    redirect: {
      destination: url,
      permanent: true,
    }
  }
}

export default Short

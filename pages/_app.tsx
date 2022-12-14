import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useAuth0 } from "@auth0/auth0-react";

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import clientConfig from '../convex/_generated/clientConfig'
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import convexConfig from "../convex.json";

const convex = new ConvexReactClient(clientConfig);
const authInfo = convexConfig.authInfo[0];


export function Login() {
  const { isLoading, loginWithRedirect } = useAuth0();
  if (isLoading) {
    return <button className="btn btn-primary">Loading...</button>;
  }
  return (
    <main className="py-4">
      <h1 className="text-center">Short URL</h1>
      <div className="text-center">
        <span>
          <button className="btn btn-primary" onClick={loginWithRedirect}>
            Log in
          </button>
        </span>
      </div>
    </main>
  );
}


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConvexProviderWithAuth0
      client={convex}
      authInfo={authInfo}
      loggedOut={<Login />}
    >
      <Component {...pageProps} />
    </ConvexProviderWithAuth0>
  )
}

export default MyApp

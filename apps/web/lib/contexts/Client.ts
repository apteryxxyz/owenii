import { Client, Collection } from '@qwaroo/client';
import type { GetServerSidePropsContext } from 'next';
import { createContext, useContext } from 'react';
import { getApiUrl, getCdnUrl } from '#/utilities/env';

export const ClientContext = createContext<Client>(null!);
export const ClientProvider = ClientContext.Provider;
export const ClientCache = new Collection<string, Client>();

export function useClient(req?: GetServerSidePropsContext['req']) {
    if (req) return useOnServer(req);
    return useOnClient();
}

export function createClient() {
    return new Client({
        api: { baseUrl: getApiUrl() },
        cdn: { baseUrl: getCdnUrl() },
    });
}

function useOnServer(req: GetServerSidePropsContext['req']) {
    const userId = req.cookies['qwaroo.user_id'];
    const token = req.cookies['qwaroo.token'];

    if (!userId || !token) return createClient();
    if (ClientCache.has(token)) return ClientCache.get(token)!;

    const client = createClient();
    client.prepare(userId, token);
    ClientCache.set(token, client);
    return client;
}

function useOnClient() {
    const client = useContext(ClientContext);
    if (client.hasTriedToPrepare) return client;
    if (typeof localStorage === 'undefined') return client;

    const userId = localStorage.getItem('qwaroo.user_id');
    const token = localStorage.getItem('qwaroo.token');

    if (!userId || !token) return client;
    client.prepare(userId, token);
    client.hasTriedToPrepare = true;
    void client.login();
    return client;
}

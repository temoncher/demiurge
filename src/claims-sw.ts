import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

let denylist: undefined | RegExp[];

if (import.meta.env.DEV) denylist = [/^\/manifest.webmanifest$/];

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { denylist }));

// @ts-expect-error `skipWaiting` does not exist on `self`
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
self.skipWaiting();
console.log(self);
clientsClaim();

#!/usr/bin/env node

import esbuildServe from "esbuild-serve";

esbuildServe(
    {
        logLevel: "info",
        entryPoints: ["src/main.js"],
        bundle: true,
        outfile: "www/js/main.js",
    },
    { root: "www" }
);

import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import basePath from "lume/plugins/base_path.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import pagefind from "lume/plugins/pagefind.ts";
import sitemap from "lume/plugins/sitemap.ts";
import toc from "https://deno.land/x/lume_markdown_plugins@v0.1.0/toc/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import codecopy from "./codecopy.ts";


const markdown = {
    plugins: [toc],
    keepDefaultPlugins: true,
};

const site = lume({
    location: new URL("https://Offsec.PenTest.Tools"),
    src: "./src",
    dest: "./_site",
    emptyDest: true,
    prettyUrls: true,
    server: {
        port: 3000,
        page404: "/404",
        open: false,
    },
    watcher: {
        debounce: 1000,
    },
},
{ markdown });

site
.ignore("README.md")
.copy("assets", ".")
.use(date())
.use(codeHighlight({
    options: {
        classPrefix: "syntax-",
    },
}))
.use(basePath())
.use(slugifyUrls({ alphanumeric: false }))
.use(resolveUrls())
.use(pagefind({
    // ui: false,
    ui: {
        containerId: "search",
        showImages: false,
        showEmptyFilters: true,
        resetStyles: true,
    },
}))
.use(sitemap())
.use(tailwindcss({
    options: {
        theme: {
            colors: {
                'black': '#000000',
                'emerald': '#047857',
                'emerald-dark': '#064e3b',
                'emerald-light': '#059669',
                'indigo': '#3730a3',
                'indigo-dark': '#312e81',
                'indigo-light': '#4f46e5',
                'lime': '#4d7c0f',
                'lime-dark': '#365314',
                'lime-light': '#65a30d',
                'navy': '#081624',
                'navy-dark': '#031018',
                'navy-light': '#1a1d2f',
                'navy-light-super': '#29283e',
                'orange': '#c2410c',
                'orange-dark': '#7c2d12',
                'orange-light': '#ea580c',
                'pink': '#db2777',
                'pink-dark': '#9d174d',
                'pink-light': '#f472b6',
                'red': '#7f1d1d',
                'red-dark': '#450a0a',
                'red-light': '#b91c1c',
                'sky': '#0369a1',
                'sky-dark': '#0c4a6e',
                'sky-light': '#0284c7',
                'slate': '#1e293b',
                'slate-dark': '#0f172a',
                'slate-light': '#334155',
                'white': '#dadada',
                'white-dark': '#b9b9b9',
                'yellow': '#854d0e',
                'yellow-dark': '#422006',
                'yellow-light': '#ca8a04',
                'transparent': 'transparent',
            },
            fontFamily: {
                basisc: ["sans-serif"],
                title: ["courier"],
            }
        }
    }
}))
.use(postcss())
.use(codecopy());

site.helper("titlize", (text: string) => {
    const tSplit = text.split(/[\-\_]/g);
    return tSplit.map((t: string) => {
        const newT = [...t];
        newT[0] = newT[0].toUpperCase();
        return newT.join("");
    }).join(" ");
}, { type: "filter" });

export default site;

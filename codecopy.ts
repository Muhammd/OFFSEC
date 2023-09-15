import { merge } from "lume/core/utils.ts";

import type { Page, Site } from "lume/core.ts";

export interface BuildOptions {
    buildDir: string;
}

export interface ButtonStylesOptions {
    top: string;
    right: string;
    width: string;
    height: string;
    padding: string;
    background: string;
    backgroundHovered: string;
    border: string;
    outline: string;
    display: string;
    flexDirection: string;
    alignItems: string;
    justifyContent: string;
    opacity: string;
    transition: string;
}

export interface ResultStylesOptions {
    top: string;
    right: string;
    opacity: string;
    fontSize: string;
    fontWeight: string;
    color: string;
    pointerEvents: string;
    transition: string;
}

export interface UIOptions {
    buttonStyles: Partial<ButtonStylesOptions>;
    resultText: string;
    resultStyles: Partial<ResultStylesOptions>;
    resultTime: number;
}

export interface Options {
    build: BuildOptions;
    ui: UIOptions;
}

const defaults: Options = {
    build: {
        buildDir: "codecopy",
    },
    ui: {
        buttonStyles: {
            top: "0",
            right: "0",
            width: "42px",
            height: "42px",
            padding: "12px",
            background: "#555585",
            backgroundHovered: "#8888c8",
            border: "none",
            outline: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: "0",
            transition: "0.1s",
        },
        resultText: "Copied!",
        resultStyles: {
            top: "-30px",
            right: "-10px",
            opacity: "0",
            fontSize: "1.1em",
            fontWeight: "bold",
            color: "#12efb5",
            pointerEvents: "none",
            transition: "0.1s",
        },
        resultTime: 2000,
    },
};

export default function (userOptions?: Partial<Options>) {
    const options = merge(defaults, userOptions);

    return (site: Site) => {
        const { build, ui } = options;
        const codecopyDir = site.dest() + "/" + build.buildDir;

        site.process([".html"], (page) => {
            addCopyElem(page);
        });

        site.addEventListener("afterBuild", async () => {
            const encoder = new TextEncoder();

            // Create a directory for codecopy
            await Deno.mkdir(`${codecopyDir}`);

            // Create codecopy.css
            const cssCode = `/* The css file generate by the codecopy plugin. */
.codecopy_pre {
    position: relative;
}
.codecopy_pre:hover .codecopy_copy {
    opacity: 1;
}

.codecopy_copy {
    box-sizing: border-box;
    position: absolute;
    top: ${ui.buttonStyles.top};
    right: ${ui.buttonStyles.right};
    width: ${ui.buttonStyles.width};
    height: ${ui.buttonStyles.height};
    padding: ${ui.buttonStyles.padding};
    background: ${ui.buttonStyles.background};
    border: ${ui.buttonStyles.border};
    outline: ${ui.buttonStyles.outline};
    display: ${ui.buttonStyles.display};
    flex-direction: ${ui.buttonStyles.flexDirection};
    align-items: ${ui.buttonStyles.alignItems};
    justify-content: ${ui.buttonStyles.justifyContent};
    cursor: pointer;
    opacity: ${ui.buttonStyles.opacity};
    transition: ${ui.buttonStyles.transition};
}
.codecopy_copy:hover {
    background: ${ui.buttonStyles.backgroundHovered};
}

.codecopy_result {
    position: absolute;
    top: ${ui.resultStyles.top};
    right: ${ui.resultStyles.right};
    opacity: ${ui.resultStyles.opacity};
    font-size: ${ui.resultStyles.fontSize};
    font-weight: ${ui.resultStyles.fontWeight};
    color: ${ui.resultStyles.color};
    pointer-events: ${ui.resultStyles.pointerEvents};
    transition: ${ui.resultStyles.transition};
}`;

            const dataCSS = encoder.encode(cssCode);
            await Deno.writeFile(`${codecopyDir}/codecopy.css`, dataCSS);

            // Create codecopy.js
            const jsCode = `// The javascript file generated by the codecopy plugin.
document.addEventListener('DOMContentLoaded', () => {
    const copyElems = document.querySelectorAll(".codecopy_copy");
    [].forEach.call(copyElems, (copyElem) => {
        const idx = copyElem.getAttribute("data-codecopy");
        copyElem.addEventListener("click", () => {
            const preElem = document.querySelector(".codecopy_pre_" + idx);
            const codeElem = preElem.getElementsByTagName("code")[0];
            navigator.clipboard.writeText(codeElem.innerText);
            // Display result text.
            const copiedElem = copyElem.querySelector(".codecopy_result");
            copiedElem.style.opacity = "1";
            setTimeout(() => {
                copiedElem.style.opacity = "0";
            }, ${ui.resultTime});
        });
    });
});`;
            const dataJS = encoder.encode(jsCode);
            await Deno.writeFile(`${codecopyDir}/codecopy.js`, dataJS);
        });
        
        function addCopyElem(page: Page) {
            const { document } = page;
            if (!document) {
                return;
            }
            const headElem = document.head;
            const pres = document.getElementsByTagName("pre");
            
            Array.from(pres).forEach((pre: any, idx: number) => {
                pre.classList.add("codecopy_pre");
                pre.classList.add(`codecopy_pre_${idx}`);
                
                const copyElem = document.createElement("button");
                copyElem.classList.add("codecopy_copy");
                copyElem.setAttribute("data-codecopy", idx);
                // copyElem.innerText = ui.buttonText;
                copyElem.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
</svg>`;
    
                const copiedText = document.createElement("span");
                copiedText.classList.add("codecopy_result");
                copiedText.innerText = ui.resultText;
    
                copyElem.appendChild(copiedText);
                pre.appendChild(copyElem);
            });
    
            // Add a link tag which loads codecopy.css
            const linkElem = document.createElement("link");
            linkElem.setAttribute("rel", "stylesheet");
            linkElem.setAttribute("href", "/codecopy/codecopy.css");
            headElem.appendChild(linkElem);
            
            // Add a script tag which load codecopy.js
            const scriptElem = document.createElement("script");
            scriptElem.setAttribute("type", "text/javascript");
            scriptElem.setAttribute("src", `/codecopy/codecopy.js`);
            headElem.appendChild(scriptElem);
        }
    }

}
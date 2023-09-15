// The javascript file generated by the codecopy plugin.
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
            }, 2000);
        });
    });
});
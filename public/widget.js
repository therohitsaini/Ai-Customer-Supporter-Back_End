(function () {
    const scriptTag = document.currentScript;
    const widgetId = scriptTag.getAttribute("data-widget-id");
    const user_Info = scriptTag.getAttribute("data-user-info");
    const domain = window.location.hostname;

    const iframe = document.createElement("iframe");
    iframe.src = `http://localhost:5173/widget/${widgetId}?user=${encodeURIComponent(user_Info)}&domain=${encodeURIComponent(domain)}`;
    iframe.style.position = "fixed";
    iframe.style.bottom = "0";
    iframe.style.right = "0";
    iframe.style.width = "400px";
    iframe.style.height = "590px";
    iframe.style.border = "none";
    iframe.style.zIndex = "9999";
    document.body.appendChild(iframe);
})();
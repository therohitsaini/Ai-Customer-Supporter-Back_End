(function () {
    const scriptTag = document.currentScript;
    const widgetId = scriptTag.getAttribute("data-widget-id");

    const iframe = document.createElement("iframe");
    iframe.src = `http://localhost:5173/widget/${widgetId}`;
    iframe.style.position = "fixed";
    iframe.style.bottom = "0";
    iframe.style.right = "0";
    iframe.style.width = "400px";
    iframe.style.height = "550px";
    iframe.style.border = "none";
    iframe.style.zIndex = "9999";
   // Initially hide the widget

    document.body.appendChild(iframe);
})();
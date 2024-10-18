const Ziggy = {
    "url": "http:\/\/localhost:8080",
    "port": 8080,
    "defaults": {},
    "routes": {
        "sanctum.csrf-cookie": {"uri": "sanctum\/csrf-cookie", "methods": ["GET", "HEAD"]},
        "api.models.replace-viewed": {"uri": "api\/models\/replace-viewed", "methods": ["GET", "HEAD"]},
        "api.models.viewed": {"uri": "api\/models\/viewed", "methods": ["GET", "HEAD"]},
        "api.models.grade": {"uri": "api\/models\/grade", "methods": ["PUT"]},
        "models.index": {
            "uri": "models\/{modelId?}",
            "methods": ["GET", "HEAD"],
            "wheres": {"modelId": "[0-9]+"},
            "parameters": ["modelId"]
        }
    }
};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export {Ziggy};

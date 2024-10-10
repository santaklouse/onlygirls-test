const Ziggy = {"url":"https:\/\/onlygirls.wrtc.pp.ua","port":null,"defaults":{},"routes":{"sanctum.csrf-cookie":{"uri":"sanctum\/csrf-cookie","methods":["GET","HEAD"]},"api.grade.new":{"uri":"api\/model\/grade","methods":["PUT"]},"models.index":{"uri":"models\/{modelId?}","methods":["GET","HEAD"],"wheres":{"modelId":"[0-9]+"},"parameters":["modelId"]}}};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
  Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };

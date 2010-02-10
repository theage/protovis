pv.Layout.radial = function(map) {
  var nodes;

  /** @private */
  function size(n) {
    return n.size = n.childNodes ? (1 + pv.sum(n.childNodes, size)) : 1;
  }

  /** @private */
  function depth(n) {
    return n.childNodes ? (1 + pv.max(n.childNodes, depth)) : 0;
  }

  /** @private */
  function divide(n) {
    var startAngle = n.startAngle;
    for (var c = n.firstChild; c; c = c.nextSibling) {
      var angle = (c.size / (n.size - 1)) * n.angle;
      c.startAngle = startAngle;
      c.angle = angle;
      c.midAngle = startAngle + angle / 2;
      c.depth = n.depth + 1;
      startAngle += angle;
      if (c.childNodes) divide(c);
    }
  }

  /** @private */
  function data() {
    if (nodes) return nodes;
    nodes = pv.dom(map).nodes();

    var root = nodes[0];
    root.startAngle = -Math.PI / 2;
    root.midAngle = 0;
    root.angle = 2 * Math.PI;
    root.depth = 0;
    size(root);
    divide(root);

    /* Scale the positions. */
    var w = this.parent.width(),
        h = this.parent.height(),
        r = Math.min(w, h) / (2 * depth(root) - 1);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], d = r * Math.max(0, n.depth - .5);
      n.left = w / 2 + d * Math.cos(n.midAngle);
      n.top = h / 2 + d * Math.sin(n.midAngle);
    }

    return nodes;
  }

  var layout = {};

  layout.nodes = data;

  /* A dummy mark, like an anchor, which the caller extends. */
  layout.node = new pv.Mark()
      .data(data)
      .strokeStyle("#1f77b4")
      .fillStyle("white")
      .left(function(n) { return n.left; })
      .top(function(n) { return n.top; });

  /* A dummy mark, like an anchor, which the caller extends. */
  layout.link = new pv.Mark().extend(layout.node)
      .data(function(n) { return n.parentNode ? [n, n.parentNode] : []; })
      .fillStyle(null)
      .strokeStyle("#ccc");

  /* A dummy mark, like an anchor, which the caller extends. */
  layout.label = new pv.Mark().extend(layout.node)
      .textAngle(function(n) {
          var a = n.midAngle;
          return pv.Wedge.upright(a) ? a : (a + Math.PI);
        })
      .textMargin(7)
      .textBaseline("middle")
      .textAlign(function(n) {
          return pv.Wedge.upright(n.midAngle) ? "left" : "right";
        })
      .text(function(n) { return n.parentNode ? n.nodeName : "root"; });

  return layout;
};
